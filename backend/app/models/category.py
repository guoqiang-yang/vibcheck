from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Category(Base):
    __tablename__ = "t_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
