from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event, inspect
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.models.base import Base

engine: Engine | None = None
SessionLocal: sessionmaker[Session] | None = None


def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")


def _is_memory_sqlite(url: str) -> bool:
    return _is_sqlite(url) and (":memory:" in url or "mode=memory" in url)


def _engine_options(url: str) -> dict:
    """SQLite needs different pooling and threading options than Postgres."""
    if not _is_sqlite(url):
        return {"pool_pre_ping": True}
    options: dict = {"connect_args": {"check_same_thread": False}}
    if _is_memory_sqlite(url):
        # A shared pool keeps an in-memory database alive across sessions.
        options["poolclass"] = StaticPool
    return options


def create_db_engine(url: str) -> Engine:
    new_engine = create_engine(url, **_engine_options(url))
    if _is_sqlite(url):

        @event.listens_for(new_engine, "connect")
        def _enable_sqlite_foreign_keys(dbapi_connection, _record):
            # SQLite ignores foreign keys unless asked, which would hide the
            # ordering bugs Postgres rejects.
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return new_engine


def configure_engine(url: str) -> sessionmaker[Session]:
    """Point the module at a database and build its session factory."""
    global engine, SessionLocal
    if engine is not None:
        engine.dispose()
    engine = create_db_engine(url)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    return SessionLocal


if settings.use_database:
    configure_engine(settings.database_url)


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


def _stamp_alembic_head(url: str) -> None:
    """Record the current revision so `alembic upgrade head` still works later."""
    from alembic import command
    from alembic.config import Config

    backend_root = Path(__file__).resolve().parents[2]
    config = Config(str(backend_root / "alembic.ini"))
    config.set_main_option("script_location", str(backend_root / "alembic"))
    config.set_main_option("sqlalchemy.url", url)
    command.stamp(config, "head")


def init_database() -> None:
    """Bootstrap a fresh dev database. Alembic owns already-migrated schemas."""
    if engine is None:
        return
    from app import models as _models  # noqa: F401  — register metadata

    if "alembic_version" in inspect(engine).get_table_names():
        # Alembic is managing this database; create_all would mask pending migrations.
        return
    Base.metadata.create_all(bind=engine)
    _stamp_alembic_head(engine.url.render_as_string(hide_password=False))
