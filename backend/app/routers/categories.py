from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

DEFAULT_USER_ID = 1000
MAX_CATEGORIES = 10


@router.get("", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.user_id == DEFAULT_USER_ID)
        .order_by(Category.is_deleted.asc(), Category.id.asc())
        .all()
    )


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(body: CategoryCreate, db: Session = Depends(get_db)):
    total = db.query(Category).filter(Category.user_id == DEFAULT_USER_ID).count()
    if total >= MAX_CATEGORIES:
        raise HTTPException(status_code=400, detail="已达分类上限（10个），可恢复已删除分类或先删除旧分类")
    cat = Category(user_id=DEFAULT_USER_ID, name=body.name, color=body.color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: int, body: CategoryUpdate, db: Session = Depends(get_db)):
    cat = (
        db.query(Category)
        .filter(Category.id == cat_id, Category.user_id == DEFAULT_USER_ID, Category.is_deleted == 0)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    if body.name is not None:
        cat.name = body.name
    if body.color is not None:
        cat.color = body.color
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db)):
    cat = (
        db.query(Category)
        .filter(Category.id == cat_id, Category.user_id == DEFAULT_USER_ID, Category.is_deleted == 0)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在")
    cat.is_deleted = 1
    db.commit()
    return {"ok": True}


@router.post("/{cat_id}/restore", response_model=CategoryResponse)
def restore_category(cat_id: int, db: Session = Depends(get_db)):
    cat = (
        db.query(Category)
        .filter(Category.id == cat_id, Category.user_id == DEFAULT_USER_ID, Category.is_deleted == 1)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=404, detail="分类不存在或未被删除")
    cat.is_deleted = 0
    db.commit()
    db.refresh(cat)
    return cat
