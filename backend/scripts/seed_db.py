"""Idempotent database seed."""

from app.core.database import SessionLocal, init_database
from app.services.seed_db import seed_database


def main() -> None:
    init_database()
    if SessionLocal is None:
        print("USE_DATABASE=false — in-memory seed is loaded at process start.")
        return
    db = SessionLocal()
    try:
        seed_database(db)
        db.commit()
        print("Seeded Postgres catalog, goals, sources, and activity.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
