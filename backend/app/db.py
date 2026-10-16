import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from .models import Base
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aegis.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}, pool_pre_ping=True)
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def fk(dbapi, _): dbapi.execute("PRAGMA foreign_keys=ON")
SessionLocal = sessionmaker(engine, expire_on_commit=False)
def get_db():
    with SessionLocal() as db: yield db
