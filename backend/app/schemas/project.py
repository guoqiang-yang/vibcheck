from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    name: str
    maintainer: str
    category: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    location_detail: Optional[str] = None
    client: Optional[str] = None
    contractor: Optional[str] = None
    amount: Optional[float] = None
    start_date: Optional[date] = None
    finish_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    maintainer: Optional[str] = None
    category: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    location_detail: Optional[str] = None
    client: Optional[str] = None
    contractor: Optional[str] = None
    amount: Optional[float] = None
    start_date: Optional[date] = None
    finish_date: Optional[date] = None
    status: Optional[ProjectStatus] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    maintainer: str
    name: str
    category: Optional[str]
    province: Optional[str]
    city: Optional[str]
    location_detail: Optional[str]
    client: Optional[str]
    contractor: Optional[str]
    amount: Optional[float]
    start_date: Optional[date]
    finish_date: Optional[date]
    status: Optional[ProjectStatus]
    description: Optional[str]
    is_deleted: bool
    created_at: datetime

    model_config = {"from_attributes": True}
