from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import Settings
from .models import Base

settings = Settings()
connect_args = {"check_same_thread": False} if settings.is_sqlite else {}
engine = create_engine(settings.sqlalchemy_database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    # SQLite is a disposable local store. PostgreSQL/Supabase schema changes
    # are applied only through reviewed migrations.
    if settings.is_sqlite:
        Base.metadata.create_all(engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
