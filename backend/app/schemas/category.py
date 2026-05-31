from pydantic import BaseModel
from datetime import datetime


class CategoryResponse(BaseModel):
    id: int
    user_id: int
    name: str
    color: str
    created_at: datetime

    model_config = {"from_attributes": True}
