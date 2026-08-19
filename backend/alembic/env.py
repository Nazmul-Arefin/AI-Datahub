from logging.config import fileConfig

from alembic import context

from app.core.config import settings
from app.core.database import create_db_engine
from app.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Priority: programmatic connection > -x db_url=... > caller-set url > .env.
# alembic.ini deliberately leaves sqlalchemy.url unset so this order holds.
_x_args = context.get_x_argument(as_dictionary=True)
database_url = (
    _x_args.get("db_url")
    or config.get_main_option("sqlalchemy.url")
    or settings.database_url
)
config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _run(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=connection.dialect.name == "sqlite",
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Tests and scripts can hand us an open connection via config.attributes.
    existing = config.attributes.get("connection")
    if existing is not None:
        _run(existing)
        return

    connectable = create_db_engine(config.get_main_option("sqlalchemy.url"))
    try:
        with connectable.connect() as connection:
            _run(connection)
    finally:
        connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
