from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.models.bill import Bill
from app.models.bill_category import BillCategory
from app.models.project import Project
from app.schemas.bill import BillCreate, BillUpdate, BillItem, BillListResponse
from typing import Optional

router = APIRouter(prefix="/api/v1/bills", tags=["bills"])

USER_ID = 1000


def _to_item(bill: Bill, db: Session) -> BillItem:
    cat_name = None
    proj_name = None
    if bill.category_id:
        cat = db.query(BillCategory).filter(BillCategory.id == bill.category_id).first()
        cat_name = cat.name if cat else None
    if bill.project_id:
        proj = db.query(Project).filter(Project.id == bill.project_id).first()
        proj_name = proj.name if proj else None
    return BillItem(
        id=bill.id,
        user_id=bill.user_id,
        bill_date=bill.bill_date,
        amount=float(bill.amount),
        category_id=bill.category_id,
        category_name=cat_name,
        project_id=bill.project_id,
        project_name=proj_name,
        person=bill.person,
        description=bill.description,
        created_at=bill.created_at,
    )


@router.get("", response_model=BillListResponse)
def list_bills(
    year: Optional[int] = None,
    month: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Bill).filter(Bill.user_id == USER_ID, Bill.is_deleted == 0)
    if year:
        q = q.filter(extract("year", Bill.bill_date) == year)
    if month:
        q = q.filter(extract("month", Bill.bill_date) == month)

    total = q.count()
    total_amount = db.query(func.sum(Bill.amount)).filter(
        Bill.user_id == USER_ID, Bill.is_deleted == 0,
        *([extract("year", Bill.bill_date) == year] if year else []),
        *([extract("month", Bill.bill_date) == month] if month else []),
    ).scalar() or 0.0

    rows = q.order_by(Bill.bill_date.desc()).offset(offset).limit(limit).all()
    return BillListResponse(
        total=total,
        total_amount=float(total_amount),
        items=[_to_item(b, db) for b in rows],
    )


@router.post("", response_model=BillItem)
def create_bill(body: BillCreate, db: Session = Depends(get_db)):
    bill = Bill(user_id=USER_ID, **body.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return _to_item(bill, db)


@router.put("/{bill_id}", response_model=BillItem)
def update_bill(bill_id: int, body: BillUpdate, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == USER_ID, Bill.is_deleted == 0).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(bill, field, val)
    db.commit()
    db.refresh(bill)
    return _to_item(bill, db)


@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == USER_ID, Bill.is_deleted == 0).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Not found")
    bill.is_deleted = 1
    db.commit()
    return {"ok": True}
