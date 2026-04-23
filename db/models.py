from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, nullable=False, index=True)
    name       = Column(String, nullable=False)
    password   = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    favorites  = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="favorites")
    university = relationship("University")

    __table_args__ = (
        UniqueConstraint("user_id", "university_id", name="uq_user_university"),
    )


class University(Base):
    __tablename__ = "universities"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    short_name  = Column(String)
    city        = Column(String)
    direction   = Column(String)
    website     = Column(String)
    slug        = Column(String)
    photo_url   = Column(String)
    tag         = Column(String)
    tag_color   = Column(String, default="blue")
    rating      = Column(Integer)

    scores      = relationship("Score", back_populates="university", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"

    id              = Column(Integer, primary_key=True, index=True)
    university_id   = Column(Integer, ForeignKey("universities.id"), nullable=False)
    year            = Column(Integer, nullable=False)
    min_score       = Column(Integer)
    avg_score       = Column(Integer)
    min_score_paid  = Column(Integer)
    tuition_fee     = Column(Integer)
    budget_places   = Column(Integer)

    university = relationship("University", back_populates="scores")

    __table_args__ = (
        UniqueConstraint("university_id", "year", name="uq_university_year"),
    )