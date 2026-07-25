"""CLI entrypoint.

Examples:
  python -m shsfkyy_appointment_crawler
  python -m shsfkyy_appointment_crawler --with-schedule --schedule-limit 10
  python -m shsfkyy_appointment_crawler --out-dir ./output --delay 1.0
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .crawler import ShsfkyyAppointmentCrawler
from .export import save_departments_csv, save_doctors_csv, save_json


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="爬取同济大学附属上海市肺科医院公开预约信息（须知/科室/医生目录）"
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path("output"),
        help="输出目录（默认 ./output）",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.8,
        help="请求间隔秒数，默认 0.8",
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="只抓专家列表页，不遍历科室页（更快）",
    )
    parser.add_argument(
        "--with-schedule",
        action="store_true",
        help="额外抓取医生出诊/挂号备注（聚合站信息，非官方实时号源）",
    )
    parser.add_argument(
        "--schedule-limit",
        type=int,
        default=20,
        help="抓取出诊备注的医生数量上限，默认 20",
    )
    parser.add_argument(
        "--print-summary",
        action="store_true",
        help="在终端打印摘要",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    crawler = ShsfkyyAppointmentCrawler(delay=args.delay)

    try:
        data = crawler.crawl(
            include_dept_doctors=not args.list_only,
            with_schedule=args.with_schedule,
            schedule_limit=args.schedule_limit,
        )
    except Exception as exc:  # noqa: BLE001 - CLI boundary
        print(f"爬取失败: {exc}", file=sys.stderr)
        return 1

    out_dir: Path = args.out_dir
    save_json(data, out_dir / "appointment_info.json")
    save_doctors_csv(data["doctors"], out_dir / "doctors.csv")
    save_departments_csv(data["departments"], out_dir / "departments.csv")

    guide = data["hospital"]["appointment_guide"]
    summary = {
        "hospital": data["hospital"]["name"],
        "departments": len(data["departments"]),
        "doctors": len(data["doctors"]),
        "release_times": guide.get("release_times"),
        "channels": [item["channel"] for item in guide.get("channels", [])],
        "official_sites": data["official_sites"],
        "output": str(out_dir.resolve()),
    }

    if args.print_summary:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print(
            f"完成：科室 {summary['departments']} 个，医生 {summary['doctors']} 位。"
            f"结果已写入 {summary['output']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
