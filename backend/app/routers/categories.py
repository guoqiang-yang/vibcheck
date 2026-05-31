from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

DEFAULT_USER_ID = 1000


@router.get("", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.user_id == DEFAULT_USER_ID).all()
