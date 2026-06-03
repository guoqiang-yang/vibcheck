from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta, time as dt_time
from typing import Any

from app.database import get_db
from app.models.time_event import TimeEvent, EventType
from app.models.category import Category

router = APIRouter(prefix="/api/v1/stats", tags=["stats"])

DEFAULT_USER_ID = 1000


def _to_minutes(t: Any) -> int:
    """Handle both datetime.time and datetime.timedelta (PyMySQL quirk)."""
    if isinstance(t, timedelta):
        return int(t.total_seconds() // 60)
    if isinstance(t, dt_time):
        return t.hour * 60 + t.minute
    return 0


def _get_week_bounds(year: int, week: int) -> tuple[date, date]:
    """ISO week: Monday–Sunday."""
    jan4 = date(year, 1, 4)
    monday_of_week1 = jan4 - timedelta(days=jan4.isoweekday() - 1)
    start = monday_of_week1 + timedelta(weeks=week - 1)
    end = start + timedelta(days=6)
    return start, end


@router.get("/weekly")
def weekly_stats(year: int, week: int, db: Session = Depends(get_db)):
    start, end = _get_week_bounds(year, week)

    events = (
        db.query(TimeEvent)
        .filter(
            TimeEvent.user_id == DEFAULT_USER_ID,
            TimeEvent.type == EventType.actual,
            TimeEvent.end_time.isnot(None),
            TimeEvent.date >= start,
            TimeEvent.date <= end,
        )
        .all()
    )

    cat_map = {
        c.id: c
        for c in db.query(Category).filter(Category.user_id == DEFAULT_USER_ID).all()
    }

    # Aggregate per day per category
    day_cat: dict[str, dict[int | None, float]] = {}
    eng: dict[str, float] = {"high": 0, "mid": 0, "low": 0}

    for ev in events:
        hours = (_to_minutes(ev.end_time) - _to_minutes(ev.start_time)) / 60
        if hours <= 0:
            continue
        d_str = ev.date.isoformat()
        day_cat.setdefault(d_str, {})
        day_cat[d_str][ev.category_id] = day_cat[d_str].get(ev.category_id, 0) + hours
        if ev.engagement:
            eng[ev.engagement.value] = eng.get(ev.engagement.value, 0) + hours

    by_day = []
    for i in range(7):
        d = start + timedelta(days=i)
        d_str = d.isoformat()
        cats = day_cat.get(d_str, {})
        segments = []
        total_day = 0.0
        for cat_id, hours in cats.items():
            cat = cat_map.get(cat_id) if cat_id else None
            segments.append({
                "category_id": cat_id,
                "name": cat.name if cat else "未知",
                "color": cat.color if cat else "#999999",
                "hours": round(hours, 1),
            })
            total_day += hours
        segments.sort(key=lambda x: -x["hours"])
        by_day.append({
            "date": d_str,
            "weekday": i + 1,
            "total_hours": round(total_day, 1),
            "segments": segments,
        })

    total = sum(eng.values())

    def pct(v: float) -> int:
        return round(v / total * 100) if total else 0

    return {
        "year": year,
        "week": week,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "total_hours": round(total, 1),
        "by_day": by_day,
        "engagement": {
            "high_hours": round(eng["high"], 1),
            "mid_hours": round(eng["mid"], 1),
            "low_hours": round(eng["low"], 1),
            "high_pct": pct(eng["high"]),
            "mid_pct": pct(eng["mid"]),
            "low_pct": pct(eng["low"]),
        },
    }


@router.get("/monthly")
def monthly_stats(year: int, month: int, db: Session = Depends(get_db)):
    start = date(year, month, 1)
    end = date(year if month < 12 else year + 1, month % 12 + 1, 1) - timedelta(days=1)

    events = (
        db.query(TimeEvent)
        .filter(
            TimeEvent.user_id == DEFAULT_USER_ID,
            TimeEvent.type == EventType.actual,
            TimeEvent.end_time.isnot(None),
            TimeEvent.date >= start,
            TimeEvent.date <= end,
        )
        .all()
    )

    cat_map = {
        c.id: c
        for c in db.query(Category).filter(Category.user_id == DEFAULT_USER_ID).all()
    }

    cat_hours: dict[int | None, float] = {}
    eng: dict[str, float] = {"high": 0, "mid": 0, "low": 0}
    record_days: set[date] = set()

    for ev in events:
        hours = (_to_minutes(ev.end_time) - _to_minutes(ev.start_time)) / 60
        if hours <= 0:
            continue
        cat_hours[ev.category_id] = cat_hours.get(ev.category_id, 0) + hours
        if ev.engagement:
            eng[ev.engagement.value] = eng.get(ev.engagement.value, 0) + hours
        record_days.add(ev.date)

    total = sum(cat_hours.values())

    by_category = []
    for cat_id, hours in sorted(cat_hours.items(), key=lambda x: -x[1]):
        cat = cat_map.get(cat_id) if cat_id else None
        by_category.append({
            "category_id": cat_id,
            "name": cat.name if cat else "未知",
            "color": cat.color if cat else "#999999",
            "hours": round(hours, 1),
            "pct": round(hours / total * 100) if total else 0,
        })

    def pct(v: float) -> int:
        return round(v / total * 100) if total else 0

    return {
        "year": year,
        "month": month,
        "total_hours": round(total, 1),
        "record_days": len(record_days),
        "daily_avg_hours": round(total / len(record_days), 1) if record_days else 0,
        "by_category": by_category,
        "engagement": {
            "high_hours": round(eng["high"], 1),
            "mid_hours": round(eng["mid"], 1),
            "low_hours": round(eng["low"], 1),
            "high_pct": pct(eng["high"]),
            "mid_pct": pct(eng["mid"]),
            "low_pct": pct(eng["low"]),
        },
    }
