from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base
from app.models.base import TimestampMixin

class RestaurantTable(Base, TimestampMixin):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id")
    )

    table_number = Column(String, nullable=False)

    qr_code = Column(String)

    capacity = Column(Integer, default=4)

    is_active = Column(Boolean, default=True)

    restaurant = relationship("Restaurant")