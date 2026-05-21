from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.database import Base
from app.models.base import TimestampMixin

class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id")
    )

    category_id = Column(
        Integer,
        ForeignKey("menu_categories.id")
    )

    name = Column(String, nullable=False)

    description = Column(String)

    price = Column(Float, nullable=False)

    
    image_url = Column(String, nullable=True)

    is_veg = Column(Boolean, default=True)

    is_available = Column(Boolean, default=True)

    spicy_level = Column(String)

    preparation_time = Column(Integer)

    restaurant = relationship("Restaurant")

    category = relationship("MenuCategory")