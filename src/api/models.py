from datetime import date, time, datetime

from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import (
    String,
    Boolean,
    Date,
    Time,
    DateTime,
    ForeignKey,
    Float
)

from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="user"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean(),
        nullable=False,
        default=True
    )

    reset_token: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True
    )

    reset_token_expires: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role
        }

class Category(db.Model):

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

class Event(db.Model):

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0
    )

    capacity: Mapped[int] = mapped_column(
        nullable=False
    )

    image: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    organizer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"),
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("category.id"),
        nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat(),
            "time": self.time.isoformat(),
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "price": self.price,
            "capacity": self.capacity,
            "image": self.image,
            "organizer_id": self.organizer_id,
            "category_id": self.category_id
        }

class Booking(db.Model):

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False,
        default=1
    )

    booking_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="confirmed"
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"),
        nullable=False
    )

    event_id: Mapped[int] = mapped_column(
        ForeignKey("event.id"),
        nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "quantity": self.quantity,
            "booking_date": self.booking_date.isoformat(),
            "status": self.status,
            "user_id": self.user_id,
            "event_id": self.event_id
        } 