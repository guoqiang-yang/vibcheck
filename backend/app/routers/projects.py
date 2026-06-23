from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from typing import List

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

USER_ID = 1000


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    rows = db.query(Project).filter(Project.user_id == USER_ID).order_by(
        Project.is_deleted.asc(), Project.created_at.desc()
    ).all()
    return rows


@router.post("", response_model=ProjectResponse)
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    proj = Project(user_id=USER_ID, **body.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@router.put("/{proj_id}", response_model=ProjectResponse)
def update_project(proj_id: int, body: ProjectUpdate, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == USER_ID).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(proj, field, val)
    db.commit()
    db.refresh(proj)
    return proj


@router.delete("/{proj_id}")
def delete_project(proj_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == USER_ID).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    proj.is_deleted = 1
    db.commit()
    return {"ok": True}
