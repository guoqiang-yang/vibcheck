from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


class BillCreate(BaseModel):
    bill_date: date
    amount: float
    category_id: Optional[int] = None
    project_id: Optional[int] = None
    person: Optional[str] = None
    description: Optional[str] = None


class BillUpdate(BaseModel):
    bill_date: Optional[date] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    project_id: Optional[int] = None
    person: Optional[str] = None
    description: Optional[str] = None


class BillItem(BaseModel):
    id: int
    user_id: int
    bill_date: date
    amount: float
    category_id: Optional[int]
    category_name: Optional[str]
    project_id: Optional[int]
    project_name: Optional[str]
    person: Optional[str]
    description: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class BillListResponse(BaseModel):
    total: int
    total_amount: float
    items: List[BillItem]
