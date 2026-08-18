from app.schemas.overview import OverviewResponse
from app.services.seed_data import OVERVIEW_ACTIVITY, OVERVIEW_CALENDAR, OVERVIEW_CLUSTERS


class OverviewService:
    def get_overview(self) -> OverviewResponse:
        return OverviewResponse(
            clusters=OVERVIEW_CLUSTERS,
            calendarTasks=OVERVIEW_CALENDAR,
            activity=OVERVIEW_ACTIVITY,
        )


overview_service = OverviewService()
