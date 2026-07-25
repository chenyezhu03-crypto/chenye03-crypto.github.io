"""Offline parser tests."""

from __future__ import annotations

from .crawler import ShsfkyyAppointmentCrawler, _parse_guide_sections


def test_parse_guide_sections_extracts_channels_and_release_times() -> None:
    html = """
    <p><strong>1.微信预约：</strong></p>
    <p>（1）“上海市肺科医院”公众号，每日7:00放号，可预约28天内号源；</p>
    <p><strong>2.电话预约：</strong>拨打400-820-3137预约，全天服务；</p>
    <p><strong>3.网络预约：</strong>上海医联预约平台，每日7:30放号；</p>
    """
    guide = _parse_guide_sections(html)
    channels = {item["channel"] for item in guide["channels"]}
    assert "微信" in channels
    assert "电话" in channels
    assert "网络/医联" in channels
    assert "每日7:00放号" in guide["release_times"]
    assert "每日7:30放号" in guide["release_times"]
    assert guide["booking_window_days"] == 28


def test_parse_doctor_cards_from_html() -> None:
    html = """
    <a href="/yyk/docindex/41880/">
      <span class="name--bwfWL">谢冬</span>
      <span class="title--+tbsa">主任医师</span>
      <span class="dept--uRVnB">胸外科</span>
      <span>挂号¥1500</span>
    </a>
    """
    doctors = ShsfkyyAppointmentCrawler()._parse_doctor_cards(html)
    assert len(doctors) == 1
    assert doctors[0]["id"] == "41880"
    assert doctors[0]["name"] == "谢冬"
    assert doctors[0]["title"] == "主任医师"
    assert doctors[0]["department"] == "胸外科"
    assert doctors[0]["consult_fee_yuan"] == 1500
