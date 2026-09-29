from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.bill_category import BillCategory
from app.schemas.bill_category import BillCategoryCreate, BillCategoryUpdate, BillCategoryResponse
from typing import List

router = APIRouter(prefix="/api/v1/bill-categories", tags=["bill-categories"])

USER_ID = 1000


@router.get("", response_model=List[BillCategoryResponse])
def list_bill_categories(db: Session = Depends(get_db)):
    rows = db.query(BillCategory).filter(BillCategory.user_id == USER_ID).order_by(
        BillCategory.is_deleted.asc(),
        BillCategory.parent_id.isnot(None).asc(),
        BillCategory.parent_id.asc(),
        BillCategory.id.asc(),
    ).all()
    return rows


@router.post("", response_model=BillCategoryResponse)
def create_bill_category(body: BillCategoryCreate, db: Session = Depends(get_db)):
    if body.parent_id is not None:
        parent = db.query(BillCategory).filter(
            BillCategory.id == body.parent_id,
            BillCategory.user_id == USER_ID,
            BillCategory.parent_id.is_(None),
            BillCategory.is_deleted == 0,
        ).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Invalid parent category")
    cat = BillCategory(user_id=USER_ID, name=body.name, parent_id=body.parent_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=BillCategoryResponse)
def update_bill_category(cat_id: int, body: BillCategoryUpdate, db: Session = Depends(get_db)):
    cat = db.query(BillCategory).filter(BillCategory.id == cat_id, BillCategory.user_id == USER_ID).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Not found")
    if body.name is not None:
        cat.name = body.name
    if "parent_id" in body.model_fields_set:
        if body.parent_id is None:
            cat.parent_id = None
            db.commit()
            db.refresh(cat)
            return cat
        if body.parent_id == cat.id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        child_count = db.query(BillCategory).filter(
            BillCategory.user_id == USER_ID,
            BillCategory.parent_id == cat.id,
        ).count()
        if child_count > 0:
            raise HTTPException(status_code=400, detail="Category with children cannot become a child category")
        parent = db.query(BillCategory).filter(
            BillCategory.id == body.parent_id,
            BillCategory.user_id == USER_ID,
            BillCategory.parent_id.is_(None),
            BillCategory.is_deleted == 0,
        ).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Invalid parent category")
        cat.parent_id = body.parent_id
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}")
def delete_bill_category(cat_id: int, db: Session = Depends(get_db)):
    cat = db.query(BillCategory).filter(BillCategory.id == cat_id, BillCategory.user_id == USER_ID).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Not found")
    cat.is_deleted = 1
    db.commit()
    return {"ok": True}
