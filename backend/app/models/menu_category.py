from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base
from app.models.base import TimestampMixin

class MenuCategory(Base, TimestampMixin):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id")
    )

    name = Column(String, nullable=False)

    description = Column(String)

    restaurant = relationship("Restaurant")