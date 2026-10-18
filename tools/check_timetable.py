"""data/timetable.json の書式・整合性を検査する。使い方: python tools/check_timetable.py"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
MD = re.compile(r"^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
DAY_TYPES = {"weekday", "weekend"}
DIRECTIONS = {"toStation", "toSchool"}


def minutes(text):
    return int(text[:2]) * 60 + int(text[3:])


def main():
    data = json.loads((ROOT / "data" / "timetable.json").read_text(encoding="utf-8"))
    errors = []
    routes = data["routes"]

    for rid, route in routes.items():
        if not set(route["runs"]) <= DAY_TYPES:
            errors.append(f"routes.{rid}.runs が不正")
        for p in route["suspend"]:
            if not (MD.match(p["from"]) and MD.match(p["to"])):
                errors.append(f"routes.{rid}.suspend の日付書式が不正: {p}")
        if not (ROOT / route["pdf"]).exists():
            errors.append(f"routes.{rid}.pdf が存在しない: {route['pdf']}")

    ids = set()
    for line in data["lines"]:
        lid = line["id"]
        if lid in ids:
            errors.append(f"line id が重複: {lid}")
        ids.add(lid)
        if line["route"] not in routes:
            errors.append(f"{lid}: 未定義の route {line['route']}")
        if line["direction"] not in DIRECTIONS:
            errors.append(f"{lid}: direction が不正")
        if not line["link"].startswith("http://o-bus.bus-go.com/"):
            errors.append(f"{lid}: link が不正")
        prev = -1
        for trip in line["trips"]:
            dep, arr = trip[0], trip[1]
            if not (TIME.match(dep) and TIME.match(arr)):
                errors.append(f"{lid}: 時刻書式が不正 {trip}")
                continue
            if len(trip) > 2 and trip[2] not in DAY_TYPES:
                errors.append(f"{lid}: 曜日区分が不正 {trip}")
            if minutes(arr) <= minutes(dep):
                errors.append(f"{lid}: 到着が発車以前 {trip}")
            if minutes(dep) < prev:
                errors.append(f"{lid}: 発車時刻が昇順でない {trip}")
            prev = minutes(dep)

    for extra in data["extraTrips"]:
        if extra["line"] not in ids:
            errors.append(f"extraTrips: 未定義の line {extra['line']}")
        if not (TIME.match(extra["dep"]) and TIME.match(extra["arr"])):
            errors.append(f"extraTrips: 時刻書式が不正 {extra}")
        for d in extra["dates"]:
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", d):
                errors.append(f"extraTrips: 日付書式が不正 {d}")

    if errors:
        print("\n".join(errors))
        sys.exit(1)
    total = sum(len(l["trips"]) for l in data["lines"])
    print(f"OK: {len(data['lines'])} lines, {total} trips")


if __name__ == "__main__":
    main()
