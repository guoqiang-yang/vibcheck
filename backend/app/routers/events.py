from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from typing import Optional
import uuid as uuid_lib

from app.database import get_db
from app.models.time_event import TimeEvent
from app.schemas.time_event import TimeEventCreate, TimeEventUpdate, TimeEventResponse

router = APIRouter(prefix="/api/v1/events", tags=["events"])

DEFAULT_USER_ID = 1000


@router.get("", response_model=list[TimeEventResponse])
def get_events(
    date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TimeEvent).filter(TimeEvent.user_id == DEFAULT_USER_ID)

    if date:
        query = query.filter(TimeEvent.date == date)
    elif start_date and end_date:
        query = query.filter(and_(TimeEvent.date >= start_date, TimeEvent.date <= end_date))

    return query.order_by(TimeEvent.start_time).all()


@router.post("", response_model=TimeEventResponse, status_code=201)
def create_event(body: TimeEventCreate, db: Session = Depends(get_db)):
    event = TimeEvent(
        uuid=str(uuid_lib.uuid4()),
        user_id=DEFAULT_USER_ID,
        **body.model_dump(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_uuid}", response_model=TimeEventResponse)
def update_event(event_uuid: str, body: TimeEventUpdate, db: Session = Depends(get_db)):
    event = db.query(TimeEvent).filter(
        TimeEvent.uuid == event_uuid,
        TimeEvent.user_id == DEFAULT_USER_ID,
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_uuid}", status_code=204)
def delete_event(event_uuid: str, db: Session = Depends(get_db)):
    event = db.query(TimeEvent).filter(
        TimeEvent.uuid == event_uuid,
        TimeEvent.user_id == DEFAULT_USER_ID,
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
