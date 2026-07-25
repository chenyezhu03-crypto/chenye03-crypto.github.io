"""Export crawl results to JSON / CSV."""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any


def save_json(data: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def save_doctors_csv(doctors: list[dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = ["id", "name", "title", "department", "consult_fee_yuan", "url"]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for doctor in doctors:
            writer.writerow(doctor)


def save_departments_csv(departments: list[dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = ["id", "name", "parent", "cnk_dept2_id", "url"]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for dept in departments:
            writer.writerow(dept)
