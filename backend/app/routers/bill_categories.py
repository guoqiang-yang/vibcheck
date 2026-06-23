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
        BillCategory.is_deleted.asc(), BillCategory.id.asc()
    ).all()
    return rows


@router.post("", response_model=BillCategoryResponse)
def create_bill_category(body: BillCategoryCreate, db: Session = Depends(get_db)):
    cat = BillCategory(user_id=USER_ID, name=body.name)
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
