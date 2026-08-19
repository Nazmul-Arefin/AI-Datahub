from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models.base import Base

engine = None
SessionLocal: sessionmaker[Session] | None = None

if settings.use_database:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session | None, None, None]:
    """Yield a SQLAlchemy session when USE_DATABASE=true, otherwise None."""
    if not settings.use_database or SessionLocal is None:
        yield None
        return
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_database() -> None:
    """Create tables if they do not exist (sprint bootstrap; Alembic is source of truth)."""
    if engine is None:
        return
    from app import models as _models  # noqa: F401  — register metadata

    Base.metadata.create_all(bind=engine)
