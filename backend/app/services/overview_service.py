from sqlalchemy.orm import Session

from app.models.goal import Goal as GoalRow
from app.models.source import DataSource
from app.schemas.overview import CalendarTask, OverviewCluster, OverviewResponse
from app.services.activity_service import activity_service
from app.services.goal_service import goal_service
from app.services.runtime_store import runtime_store
from app.services.source_service import source_service


class OverviewService:
    def get_overview(self, db: Session | None = None) -> OverviewResponse:
        goals = goal_service.list_goals(db=db).goals
        sources = source_service.list_sources(db=db).sources
        memory_count = sum(goal.memories for goal in goals) or 128
        if db is not None:
            goal_count = db.query(GoalRow).count()
            source_count = db.query(DataSource).count()
        else:
            goal_count = len(runtime_store.goals)
            source_count = len(runtime_store.sources)

        clusters = [
            OverviewCluster(key="goals", title="Goal Management", count=goal_count),
            OverviewCluster(key="data", title="Personal Data", count=source_count),
            OverviewCluster(key="memory", title="Long-term Memory", count=memory_count),
        ]
        calendar_tasks = [
            CalendarTask(
                id=f"cal-{goal.id}",
                title=goal.title,
                time=goal.scheduled_time,
                dayOffset=goal.schedule_offset or 0,
            )
            for goal in goals
            if goal.scheduled_time or goal.schedule_offset is not None
        ]
        return OverviewResponse(
            clusters=clusters,
            calendarTasks=calendar_tasks,
            activity=activity_service.list_recent(db=db),
        )


overview_service = OverviewService()
