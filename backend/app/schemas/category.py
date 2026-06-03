from pydantic import BaseModel, Field
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=4)
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=4)
    color: str | None = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    color: str
    is_deleted: bool
    created_at: datetime

    model_config = {"from_attributes": True}
