from sqlalchemy import Column, Integer, String, Boolean
from app.database.database import Base
from app.models.base import TimestampMixin

class Restaurant(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    description = Column(String)

    phone = Column(String)

    email = Column(String, unique=True)

    address = Column(String)

    city = Column(String)

    state = Column(String)

    country = Column(String, default="India")

    pincode = Column(String)

    logo_url = Column(String)

    primary_language = Column(String, default="English")

    is_active = Column(Boolean, default=True)