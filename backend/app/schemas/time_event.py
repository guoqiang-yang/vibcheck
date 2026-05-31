from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional
from app.models.time_event import EventType, Engagement


class TimeEventCreate(BaseModel):
    date: date
    title: str
    type: EventType
    category_id: Optional[int] = None
    start_time: time
    end_time: Optional[time] = None
    engagement: Optional[Engagement] = None
    note: Optional[str] = None
    content: Optional[str] = None


class TimeEventUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[EventType] = None
    category_id: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    engagement: Optional[Engagement] = None
    note: Optional[str] = None
    content: Optional[str] = None


class TimeEventResponse(BaseModel):
    id: int
    uuid: str
    user_id: int
    date: date
    title: str
    type: EventType
    category_id: Optional[int]
    start_time: time
    end_time: Optional[time]
    engagement: Optional[Engagement]
    note: Optional[str]
    content: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
