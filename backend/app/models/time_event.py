from sqlalchemy import BigInteger, Integer, String, Date, Time, Text, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import enum


class EventType(str, enum.Enum):
    actual = "actual"
    planned = "planned"
    inspiration = "inspiration"


class Engagement(str, enum.Enum):
    high = "high"
    mid = "mid"
    low = "low"


class TimeEvent(Base):
    __tablename__ = "t_time_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[Date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[EventType] = mapped_column(Enum(EventType), nullable=False)
    category_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    start_time: Mapped[Time] = mapped_column(Time, nullable=False)
    end_time: Mapped[Time | None] = mapped_column(Time, nullable=True)
    engagement: Mapped[Engagement | None] = mapped_column(Enum(Engagement), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
