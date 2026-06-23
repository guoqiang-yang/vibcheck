from sqlalchemy import Integer, String, Text, Date, DateTime, Numeric, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import enum


class ProjectStatus(str, enum.Enum):
    prepare = "prepare"
    ongoing = "ongoing"
    finished = "finished"
    canceled = "canceled"


class Project(Base):
    __tablename__ = "t_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    maintainer: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    province: Mapped[str | None] = mapped_column(String(30), nullable=True)
    city: Mapped[str | None] = mapped_column(String(30), nullable=True)
    location_detail: Mapped[str | None] = mapped_column(String(200), nullable=True)
    client: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contractor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    start_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    finish_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    status: Mapped[ProjectStatus | None] = mapped_column(Enum(ProjectStatus), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
