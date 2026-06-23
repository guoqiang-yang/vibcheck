from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BillCategoryCreate(BaseModel):
    name: str


class BillCategoryUpdate(BaseModel):
    name: Optional[str] = None


class BillCategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    is_deleted: bool
    created_at: datetime

    model_config = {"from_attributes": True}
