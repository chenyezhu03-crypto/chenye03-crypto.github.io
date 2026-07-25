#!/usr/bin/env python3
"""Build root index.html from template + data/appointment.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = Path(__file__).with_name("template.html")
DATA = ROOT / "data" / "appointment.json"
OUT = ROOT / "index.html"


def main() -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    data = json.loads(DATA.read_text(encoding="utf-8"))
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    if "__APPOINTMENT_JSON__" not in template:
        raise SystemExit("template missing __APPOINTMENT_JSON__ placeholder")
    OUT.write_text(template.replace("__APPOINTMENT_JSON__", payload), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
