"""Integration tests for USE_DATABASE=true.

These run against SQLite so they need no Docker, but they exercise the same
service code paths Postgres uses: real Alembic migration, real SQLAlchemy
sessions, real foreign keys.
"""

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker

from app.core.database import create_db_engine, get_db
from app.main import app
from app.models.base import Base
from app.services.seed_db import seed_database

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def _alembic_config(url: str) -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", url)
    return config


@pytest.fixture
def migrated_engine(tmp_path):
    """A SQLite database whose schema was built by Alembic, not create_all."""
    url = f"sqlite+pysqlite:///{(tmp_path / 'weeple_test.db').as_posix()}"
    engine = create_db_engine(url)
    config = _alembic_config(url)
    with engine.begin() as connection:
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def db_session_factory(migrated_engine):
    factory = sessionmaker(bind=migrated_engine, autocommit=False, autoflush=False)
    session = factory()
    try:
        seed_database(session)
        session.commit()
    finally:
        session.close()
    return factory


@pytest.fixture
async def db_client(db_session_factory):
    """API client whose requests are backed by the migrated SQLite database."""

    def override_get_db():
        session = db_session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_migration_matches_models(migrated_engine):
    """The migration must produce every table and column the models declare."""
    inspector = inspect(migrated_engine)
    actual_tables = set(inspector.get_table_names())

    for table_name, table in Base.metadata.tables.items():
        assert table_name in actual_tables, f"migration is missing table {table_name}"
        actual_columns = {column["name"] for column in inspector.get_columns(table_name)}
        expected_columns = {column.name for column in table.columns}
        missing = expected_columns - actual_columns
        assert not missing, f"{table_name} is missing columns {sorted(missing)}"


def test_migration_downgrades_cleanly(tmp_path):
    url = f"sqlite+pysqlite:///{(tmp_path / 'downgrade.db').as_posix()}"
    engine = create_db_engine(url)
    config = _alembic_config(url)
    try:
        with engine.begin() as connection:
            config.attributes["connection"] = connection
            command.upgrade(config, "head")
            command.downgrade(config, "base")
        remaining = set(inspect(engine).get_table_names()) - {"alembic_version"}
        assert remaining == set()
    finally:
        engine.dispose()


def test_bootstrap_then_migrate(tmp_path, monkeypatch):
    """Flipping USE_DATABASE=true without migrating must not block Alembic later."""
    from app.core import database

    url = f"sqlite+pysqlite:///{(tmp_path / 'bootstrap.db').as_posix()}"
    monkeypatch.setattr(database, "engine", create_db_engine(url))
    try:
        database.init_database()
        assert "alembic_version" in inspect(database.engine).get_table_names()
        # create_all already built the schema, so upgrade should be a no-op.
        config = _alembic_config(url)
        command.upgrade(config, "head")
    finally:
        database.engine.dispose()


def test_seed_is_idempotent(db_session_factory):
    session = db_session_factory()
    try:
        from app.models.goal import Goal as GoalRow

        first = session.query(GoalRow).count()
        seed_database(session)
        session.commit()
        assert session.query(GoalRow).count() == first
    finally:
        session.close()


async def test_goals_round_trip_through_database(db_client):
    listed = await db_client.get("/api/v1/goals")
    assert listed.status_code == 200
    assert listed.json()["total"] >= 1

    created = await db_client.post(
        "/api/v1/goals",
        json={"title": "Ship persistence", "category": "Project"},
    )
    assert created.status_code in {200, 201}
    goal_id = created.json()["id"]

    patched = await db_client.patch(f"/api/v1/goals/{goal_id}", json={"progress": 42})
    assert patched.status_code == 200
    assert patched.json()["progress"] == 42

    # A separate request proves the write reached the database, not a cache.
    fetched = await db_client.get(f"/api/v1/goals/{goal_id}")
    assert fetched.status_code == 200
    assert fetched.json()["progress"] == 42

    deleted = await db_client.delete(f"/api/v1/goals/{goal_id}")
    assert deleted.status_code in {200, 204}
    assert (await db_client.get(f"/api/v1/goals/{goal_id}")).status_code == 404


async def test_goal_list_order_is_stable(db_client):
    first = [goal["id"] for goal in (await db_client.get("/api/v1/goals")).json()["goals"]]
    second = [goal["id"] for goal in (await db_client.get("/api/v1/goals")).json()["goals"]]
    assert first == second


async def test_catalog_search_uses_database(db_client):
    everything = await db_client.get("/api/v1/integrations/catalog")
    assert everything.json()["total"] >= 1

    filtered = await db_client.get("/api/v1/integrations/catalog", params={"q": "calendar"})
    assert filtered.status_code == 200
    items = filtered.json()["items"]
    assert items, "expected at least one calendar integration"
    assert all(
        "calendar" in f"{item['name']} {item.get('description') or ''} {item['id']}".lower()
        for item in items
    )

    by_category = await db_client.get(
        "/api/v1/integrations/catalog", params={"category": "productivity"}
    )
    assert all(item["category"] == "productivity" for item in by_category.json()["items"])


async def test_connect_flow_persists_connection(db_client):
    started = await db_client.post(
        "/api/v1/integrations/connect",
        json={"integrationId": "github", "redirectUri": "/done"},
    )
    assert started.status_code == 200
    state = started.json()["state"]

    callback = await db_client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": state},
        follow_redirects=False,
    )
    assert callback.status_code in {200, 302, 307}

    # Re-read so the assertions hit persisted columns, not the response object
    # the write returned.
    sources = await db_client.get("/api/v1/sources")
    github = next((s for s in sources.json()["sources"] if s["id"] == "github"), None)
    assert github is not None
    assert github["statusType"] == "connected"
    assert github["connectionId"]
    assert github["connection"]["id"] == github["connectionId"]
    assert github["connection"]["status"] == "connected"


async def test_oauth_state_is_single_use(db_client):
    started = await db_client.post(
        "/api/v1/integrations/connect",
        json={"integrationId": "linear", "redirectUri": "/done"},
    )
    state = started.json()["state"]

    first = await db_client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": state},
        follow_redirects=False,
    )
    assert first.status_code in {200, 302, 307}

    replay = await db_client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": state},
        follow_redirects=False,
    )
    assert replay.status_code == 400
    assert replay.json()["error"]["code"] == "bad_request"


async def test_connection_state_loads_from_database(db_client):
    sources = (await db_client.get("/api/v1/sources")).json()["sources"]
    by_id = {source["id"]: source for source in sources}

    calendar = by_id["calendar"]
    assert calendar["connection"]["id"] == calendar["connectionId"]
    assert calendar["connection"]["status"] == "connected"
    assert calendar["connection"]["authProvider"] == "nango"

    assert by_id["iphone"]["connection"] is None


async def test_connection_state_follows_revoke_in_database(db_client):
    revoked = (await db_client.post("/api/v1/sources/notion/disconnect")).json()
    assert revoked["connection"]["status"] == "revoked"

    # Re-read to prove the connection row changed, not just the response object.
    sources = (await db_client.get("/api/v1/sources")).json()["sources"]
    notion = next(source for source in sources if source["id"] == "notion")
    assert notion["connection"]["status"] == "revoked"

    # Reconnecting a revoked OAuth grant restarts authorization instead of
    # flipping the column back, so the row stays revoked until the callback runs.
    restarted = (await db_client.post("/api/v1/sources/notion/reconnect")).json()
    assert restarted["reauthorizationRequired"] is True
    assert restarted["authorizationUrl"]

    reread = (await db_client.get("/api/v1/sources/notion")).json()
    assert reread["aiEnabled"] is False


async def test_reauthorization_persists_a_fresh_connection(db_client):
    original = (await db_client.get("/api/v1/sources/notion")).json()["connectionId"]
    await db_client.post("/api/v1/sources/notion/disconnect")
    restarted = (await db_client.post("/api/v1/sources/notion/reconnect")).json()

    await db_client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": restarted["state"]},
        follow_redirects=False,
    )

    notion = (await db_client.get("/api/v1/sources/notion")).json()
    assert notion["statusType"] == "connected"
    assert notion["aiEnabled"] is True
    assert notion["connection"]["status"] == "connected"
    # A new grant means a new connection row; the revoked one stays as history.
    assert notion["connectionId"] != original


async def test_disconnect_and_reconnect_persist(db_client):
    revoked = await db_client.post("/api/v1/sources/calendar/disconnect")
    assert revoked.status_code == 200
    assert revoked.json()["statusType"] == "revoked"
    reread = await db_client.get("/api/v1/sources", params={"category": "productivity"})
    calendar = next(s for s in reread.json()["sources"] if s["id"] == "calendar")
    assert calendar["statusType"] == "revoked"
    assert calendar["aiEnabled"] is False

    restarted = await db_client.post("/api/v1/sources/calendar/reconnect")
    assert restarted.status_code == 200
    assert restarted.json()["reauthorizationRequired"] is True

    await db_client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": restarted.json()["state"]},
        follow_redirects=False,
    )
    assert (await db_client.get("/api/v1/sources/calendar")).json()["statusType"] == "connected"


async def test_overview_counts_come_from_database(db_client):
    overview = await db_client.get("/api/v1/overview")
    assert overview.status_code == 200
    payload = overview.json()

    goals_total = (await db_client.get("/api/v1/goals")).json()["total"]
    sources_total = (await db_client.get("/api/v1/sources")).json()["total"]
    clusters = {cluster["key"]: cluster["count"] for cluster in payload["clusters"]}
    assert clusters["goals"] == goals_total
    assert clusters["data"] == sources_total
    assert payload["activity"]


async def test_activity_records_new_events(db_client):
    before = len((await db_client.get("/api/v1/overview")).json()["activity"])
    await db_client.post("/api/v1/goals", json={"title": "Activity probe"})
    after = (await db_client.get("/api/v1/overview")).json()["activity"]
    assert len(after) >= before
    assert any("Activity probe" in item["detail"] for item in after)
