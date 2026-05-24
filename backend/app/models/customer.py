from sqlalchemy import (
    Column,
    Integer,
    String,
    Text
)

from app.database.database import Base


class Customer(Base):

    __tablename__ = "customers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=True
    )

    phone = Column(
        String,
        unique=True,
        nullable=False
    )

    preferred_language = Column(
        String,
        default="English"
    )

    spice_preference = Column(
        String,
        nullable=True
    )

    dietary_preference = Column(
        String,
        nullable=True
    )

    favorite_items = Column(
        Text,
        nullable=True
    )