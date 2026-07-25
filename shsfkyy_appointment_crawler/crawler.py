"""Crawl publicly available appointment-related info for Shanghai Pulmonary Hospital.

Scope:
- Appointment guide (channels, release times, rules)
- Department list
- Doctor directory (name / title / department / fee when available)
- Optional doctor outpatient notes from aggregator pages

Out of scope (intentionally NOT implemented):
- Auto booking / slot grabbing (抢号)
- WAF / captcha bypass
- Official WeChat / Alipay / SHDC authenticated booking flows
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import unescape
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from .client import PoliteClient

HOSPITAL_ID = 108
HOSPITAL_NAME = "同济大学附属上海市肺科医院（上海市肺科医院）"
YOULAI_BASE = "https://www.youlai.cn"
OFFICIAL_SITES = {
    "hospital_website": "https://www.shsfkyy.com/",
    "shdc_appointment": "https://yuyue.shdc.org.cn/",
    "weixin_ngari": "https://weixin.ngarihealth.com/",
}

OWN_HOSPITAL_NAMES = {
    "上海市肺科医院",
    "上海肺科医院",
    "同济大学附属上海市肺科医院",
    "上海市职业病医院",
}


def _strip_html(html: str) -> str:
    soup = BeautifulSoup(html or "", "lxml")
    text = soup.get_text("\n", strip=True)
    return re.sub(r"\n{3,}", "\n\n", text)


def _parse_guide_sections(guide_html: str) -> dict[str, Any]:
    text = _strip_html(guide_html)
    channels: list[dict[str, str]] = []
    patterns = [
        (r"微信预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "微信"),
        (r"电话预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "电话"),
        (r"网络预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "网络/医联"),
        (r"支付宝预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "支付宝"),
        (r"APP预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "APP"),
        (r"现场预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "现场"),
        (r"诊间预约[:：]?\s*(.+?)(?=\n\d+\.|$)", "诊间"),
    ]
    for pattern, name in patterns:
        match = re.search(pattern, text, re.S)
        if match:
            channels.append(
                {"channel": name, "detail": re.sub(r"\s+", " ", match.group(1)).strip()}
            )

    release_times = sorted(set(re.findall(r"每日\d{1,2}:\d{2}放号", text)))
    return {
        "raw_text": text,
        "channels": channels,
        "release_times": release_times,
        "booking_window_days": 28 if "28天内" in text else None,
    }


class ShsfkyyAppointmentCrawler:
    def __init__(self, delay: float = 0.8) -> None:
        self.client = PoliteClient(delay=delay)
        self.hospital_id = HOSPITAL_ID

    def fetch_hospital_info(self) -> dict[str, Any]:
        url = f"{YOULAI_BASE}/p-h5/tencent/hospital/info"
        response = self.client.post_json(
            url,
            {"hospital_id": self.hospital_id, "guide": 1},
            headers={"Referer": f"{YOULAI_BASE}/yyk/hospindex/{self.hospital_id}/"},
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("code") != 200:
            raise RuntimeError(f"hospital info failed: {payload}")
        data = payload["data"]
        guide_html = data.get("guide") or ""
        return {
            "source": "youlai",
            "hospital_id": data.get("id"),
            "name": data.get("hospital_name") or HOSPITAL_NAME,
            "short_name": data.get("short_name"),
            "grade": data.get("grade_n"),
            "category": data.get("category_n"),
            "feature": data.get("feature"),
            "insurance": data.get("insurance_n"),
            "doctor_num": data.get("doctor_num"),
            "booking_doctor_num_on_source": data.get("hospital_booking_doctor_num"),
            "official_url": data.get("url") or OFFICIAL_SITES["hospital_website"],
            "wechat_program_link": data.get("wechat_program_link"),
            "appointment_guide": _parse_guide_sections(guide_html),
            "prepare": _strip_html(data.get("prepare") or ""),
            "traffic": _strip_html(data.get("traffic") or ""),
            "introduction": _strip_html(data.get("introduction") or "")[:2000],
        }

    def fetch_departments(self) -> list[dict[str, Any]]:
        url = f"{YOULAI_BASE}/w-api/visit/hosp_doctor_dept"
        response = self.client.post_json(
            url,
            {"hospital_id": self.hospital_id},
            headers={"Referer": f"{YOULAI_BASE}/yyk/hospindex/{self.hospital_id}/deptlist.html"},
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("code") != 200:
            raise RuntimeError(f"department list failed: {payload}")

        departments: list[dict[str, Any]] = []
        for group in payload.get("data") or []:
            parent_name = group.get("dept_name")
            for item in group.get("list") or []:
                name = (item.get("dept_name") or "").strip()
                if not name or name == "全部":
                    continue
                dept_id = item.get("id")
                departments.append(
                    {
                        "id": dept_id,
                        "name": name,
                        "parent": parent_name,
                        "cnk_dept2_id": item.get("cnk_dept2_id"),
                        "url": (
                            f"{YOULAI_BASE}/yyk/hospindex/{self.hospital_id}/"
                            f"departmentindex_{dept_id}.html"
                        ),
                    }
                )
        return departments

    def _parse_doctor_cards(
        self, html: str, default_dept: str | None = None
    ) -> list[dict[str, Any]]:
        soup = BeautifulSoup(html, "lxml")
        doctors: list[dict[str, Any]] = []
        seen: set[str] = set()

        for anchor in soup.select('a[href*="/yyk/docindex/"]'):
            href = anchor.get("href") or ""
            match = re.search(r"/yyk/docindex/(\d+)/?", href)
            if not match:
                continue
            doctor_id = match.group(1)
            if doctor_id in seen:
                continue

            name_el = anchor.select_one('[class*="name--"]')
            name = (name_el.get_text(strip=True) if name_el else anchor.get_text(strip=True)) or ""
            name = name.strip()
            if not name or name in {HOSPITAL_NAME, "上海市肺科医院", "上海肺科医院"}:
                continue
            if len(name) > 20:
                continue

            parent = anchor
            for _ in range(8):
                if parent is None or parent.parent is None:
                    break
                parent = parent.parent

            title = None
            dept = default_dept
            fee = None
            if parent is not None:
                for title_el in parent.select('[class*="title--"]'):
                    text = title_el.get_text(strip=True)
                    if "医师" in text:
                        title = text
                        break
                dept_el = parent.select_one('[class*="dept--"]')
                if dept_el:
                    dept = dept_el.get_text(strip=True) or dept
                fee_match = re.search(r"¥(\d+)", parent.get_text(" ", strip=True))
                if fee_match:
                    fee = int(fee_match.group(1))

            seen.add(doctor_id)
            doctors.append(
                {
                    "id": doctor_id,
                    "name": name,
                    "title": title,
                    "department": dept,
                    "consult_fee_yuan": fee,
                    "url": urljoin(YOULAI_BASE, href),
                }
            )
        return doctors

    def fetch_doctors_from_list_page(self) -> list[dict[str, Any]]:
        url = f"{YOULAI_BASE}/yyk/hospindex/{self.hospital_id}/doctorlist.html"
        response = self.client.get(url)
        response.raise_for_status()
        return self._parse_doctor_cards(response.text)

    def fetch_doctors_from_departments(
        self, departments: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        by_id: dict[str, dict[str, Any]] = {}
        for dept in departments:
            response = self.client.get(dept["url"])
            if response.status_code != 200:
                continue
            for doctor in self._parse_doctor_cards(response.text, default_dept=dept["name"]):
                existing = by_id.get(doctor["id"])
                if existing is None:
                    by_id[doctor["id"]] = doctor
                    continue
                for key in ("title", "department", "consult_fee_yuan"):
                    if not existing.get(key) and doctor.get(key):
                        existing[key] = doctor[key]
        return list(by_id.values())

    @staticmethod
    def _extract_point_cards_from_html(html: str) -> list[dict[str, Any]]:
        match = re.search(r'"point_card_list":(\[.*?\])\s*,\s*"register_guide"', html)
        if not match:
            return []
        raw = match.group(1).replace("\\u002F", "/")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return []

    def _belongs_to_own_hospital(self, doctor_id: str) -> tuple[bool, dict[str, Any]]:
        """Return whether doctor primary practice is Shanghai Pulmonary Hospital."""
        url = f"{YOULAI_BASE}/p-h5/tencent/doctor/pointcardlist"
        response = self.client.post_json(
            url,
            {"doctor_id": int(doctor_id)},
            headers={"Referer": f"{YOULAI_BASE}/yyk/docindex/{doctor_id}/"},
        )
        if response.status_code != 200:
            return False, {}
        payload = response.json()
        if payload.get("code") != 200:
            return False, {}
        data = payload.get("data") or {}
        hosp = (data.get("hospital_name") or data.get("hospital_short_name") or "").strip()
        if hosp in OWN_HOSPITAL_NAMES or "肺科医院" in hosp:
            return True, data

        # Fallback: primary practice card on HTML
        html_resp = self.client.get(f"{YOULAI_BASE}/yyk/docindex/{doctor_id}/")
        cards = self._extract_point_cards_from_html(html_resp.text)
        for card in cards:
            name = (card.get("name") or "").strip()
            if card.get("is_pub") == 1 and (
                name in OWN_HOSPITAL_NAMES or "肺科医院" in name
            ):
                data = {
                    **data,
                    "hospital_name": name,
                    "dept_name": card.get("dept") or data.get("dept_name"),
                    "name": data.get("name") or data.get("doctor_name"),
                }
                return True, data
        return False, data

    def filter_own_hospital_doctors(
        self, doctors: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Drop aggregator-mixed doctors from other hospitals."""
        kept: list[dict[str, Any]] = []
        for doctor in doctors:
            ok, detail = self._belongs_to_own_hospital(doctor["id"])
            if not ok:
                continue
            if detail.get("name") or detail.get("doctor_name"):
                doctor["name"] = detail.get("name") or detail.get("doctor_name")
            if detail.get("medical_title"):
                doctor["title"] = detail.get("medical_title")
            if detail.get("dept_name") or detail.get("cnk_dept2_name"):
                doctor["department"] = detail.get("dept_name") or detail.get(
                    "cnk_dept2_name"
                )
            doctor["hospital"] = detail.get("hospital_name") or "上海市肺科医院"
            kept.append(doctor)
        return kept

    def fetch_doctor_schedule_note(self, doctor_id: str) -> dict[str, Any]:
        """Fetch outpatient / booking notes from aggregator doctor page."""
        url = f"{YOULAI_BASE}/p-h5/tencent/doctor/pointcardlist"
        response = self.client.post_json(
            url,
            {"doctor_id": int(doctor_id)},
            headers={"Referer": f"{YOULAI_BASE}/yyk/docindex/{doctor_id}/"},
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("code") != 200:
            return {"doctor_id": doctor_id, "error": payload.get("msg")}

        data = payload.get("data") or {}
        cards = data.get("point_card_list")
        if not cards:
            html_resp = self.client.get(f"{YOULAI_BASE}/yyk/docindex/{doctor_id}/")
            cards = self._extract_point_cards_from_html(html_resp.text)

        hospital_notes = []
        for card in cards or []:
            hospital_notes.append(
                {
                    "hospital": card.get("name"),
                    "department": card.get("dept"),
                    "point_type": card.get("point_type_show"),
                    "schedule_note": unescape(card.get("title_show") or ""),
                    "availability_hint": card.get("fate_day") or "",
                    "price": unescape(card.get("price_show") or ""),
                    "has_visit_on_source": bool(card.get("have_visit")),
                }
            )

        return {
            "doctor_id": str(data.get("id") or doctor_id),
            "name": data.get("name") or data.get("doctor_name"),
            "title": data.get("medical_title"),
            "department": data.get("dept_name") or data.get("cnk_dept2_name"),
            "adept": data.get("adept_introduction"),
            "schedule_notes": hospital_notes,
        }

    def probe_official_sites(self) -> list[dict[str, Any]]:
        results = []
        for name, url in OFFICIAL_SITES.items():
            try:
                response = self.client.get(url, allow_redirects=True)
                blocked = response.status_code in {401, 403, 429} or "WAF" in response.text[:500]
                results.append(
                    {
                        "name": name,
                        "url": url,
                        "http_status": response.status_code,
                        "accessible": response.status_code == 200 and not blocked,
                        "note": "WAF/anti-bot blocked" if blocked else "ok",
                    }
                )
            except requests.RequestException as exc:
                results.append(
                    {
                        "name": name,
                        "url": url,
                        "http_status": None,
                        "accessible": False,
                        "note": str(exc),
                    }
                )
        return results

    def crawl(
        self,
        *,
        include_dept_doctors: bool = True,
        with_schedule: bool = False,
        schedule_limit: int = 20,
    ) -> dict[str, Any]:
        hospital = self.fetch_hospital_info()
        departments = self.fetch_departments()

        doctors_map: dict[str, dict[str, Any]] = {}
        for doctor in self.fetch_doctors_from_list_page():
            doctors_map[doctor["id"]] = doctor

        if include_dept_doctors:
            for doctor in self.fetch_doctors_from_departments(departments):
                existing = doctors_map.get(doctor["id"])
                if existing is None:
                    doctors_map[doctor["id"]] = doctor
                    continue
                for key in ("title", "department", "consult_fee_yuan"):
                    if not existing.get(key) and doctor.get(key):
                        existing[key] = doctor[key]

        doctors = sorted(
            doctors_map.values(),
            key=lambda item: (item.get("department") or "", item.get("name") or ""),
        )
        # Aggregator pages often mix in other hospitals; keep only own hospital.
        doctors = self.filter_own_hospital_doctors(doctors)
        doctors = sorted(
            doctors,
            key=lambda item: (item.get("department") or "", item.get("name") or ""),
        )

        schedule_notes: list[dict[str, Any]] = []
        if with_schedule:
            for doctor in doctors[: max(0, schedule_limit)]:
                schedule_notes.append(self.fetch_doctor_schedule_note(doctor["id"]))

        return {
            "meta": {
                "hospital": HOSPITAL_NAME,
                "crawled_at": datetime.now(timezone.utc).isoformat(),
                "source": "youlai.cn public pages/APIs",
                "doctor_filter": "仅保留第一执业为上海市肺科医院的医生",
                "weixin_booking": "https://weixin.ngarihealth.com/（需微信内通过公众号菜单进入）",
                "disclaimer": (
                    "本工具仅采集公开的预约须知、科室与医生目录信息，"
                    "不抓取官方实时号源，不提供自动挂号/抢号功能。"
                    "微信预约后台为纳里健康，请通过「上海市肺科医院」公众号进入；"
                    "也可使用支付宝或上海医联预约平台。"
                ),
            },
            "hospital": hospital,
            "departments": departments,
            "doctors": doctors,
            "doctor_schedule_notes": schedule_notes,
            "official_sites": self.probe_official_sites(),
        }
