from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BillCategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class BillCategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None


class BillCategoryResponse(BaseModel):
    id: int
    user_id: int
    parent_id: Optional[int]
    name: str
    is_deleted: bool
    created_at: datetime

    model_config = {"from_attributes": True}
