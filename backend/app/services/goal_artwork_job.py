"""Background job: generate Coze cover art for a newly created goal."""

from __future__ import annotations

import logging

from app.adapters.coze_workflow import build_goal_image_prompt, generate_goal_image
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.goal_service import goal_service

logger = logging.getLogger(__name__)


def run_goal_artwork_job(goal_id: str) -> None:
    if not goal_id:
        return

    db = None
    if settings.use_database and SessionLocal is not None:
        db = SessionLocal()

    try:
        goal = goal_service.get_goal(goal_id, db=db)
        if not goal:
            return

        if not settings.coze_enabled:
            goal_service.set_goal_artwork(goal_id, None, "idle", db=db)
            if db is not None:
                db.commit()
            return

        prompt = build_goal_image_prompt(
            title=goal.title,
            category=goal.category,
            description=goal.description,
            short=goal.short,
        )
        image_url = generate_goal_image(prompt)
        status = "ready" if image_url else "failed"
        goal_service.set_goal_artwork(goal_id, image_url, status, db=db)
        if db is not None:
            db.commit()
        if image_url:
            logger.info("Goal %s artwork ready", goal_id)
        else:
            logger.warning("Goal %s artwork generation returned no URL", goal_id)
    except Exception:
        logger.exception("Goal artwork job failed for %s", goal_id)
        try:
            if db is not None:
                db.rollback()
            goal_service.set_goal_artwork(goal_id, None, "failed", db=db)
            if db is not None:
                db.commit()
        except Exception:
            logger.exception("Failed to mark goal %s artwork as failed", goal_id)
            if db is not None:
                db.rollback()
    finally:
        if db is not None:
            db.close()
