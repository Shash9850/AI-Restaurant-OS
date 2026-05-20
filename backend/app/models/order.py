from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.database import Base
from app.models.base import TimestampMixin

class Order(Base, TimestampMixin):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id")
    )

    table_id = Column(
        Integer,
        ForeignKey("restaurant_tables.id")
    )

    order_status = Column(
        String,
        default="pending"
    )

    payment_status = Column(
        String,
        default="pending"
    )

    total_amount = Column(
        Float,
        default=0
    )

    customer_name = Column(String)

    notes = Column(String)

    restaurant = relationship("Restaurant")

    table = relationship("RestaurantTable")