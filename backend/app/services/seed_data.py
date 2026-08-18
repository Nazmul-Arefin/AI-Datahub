"""Seed data aligned with the V2.3.2 frontend mocks."""

from app.schemas.goals import Goal, GoalObservation, GoalPrediction, GoalSuggestion, Subgoal
from app.schemas.sources import IntegrationCatalogItem, Source
from app.schemas.overview import ActivityItem, CalendarTask, OverviewCluster
from app.schemas.tasks import ExecutionTask

SEED_GOALS: list[Goal] = [
    Goal(
        id="beijing-trip",
        title="Business Trip to Beijing Tomorrow",
        short="Beijing trip",
        status="Time-sensitive",
        progress=34,
        scheduleOffset=1,
        scheduledTime="08:30",
        description="Arrive in Beijing safely and protect the morning client meeting despite changing travel conditions.",
        sources=3,
        memories=4,
        outputs=2,
        tasks=3,
        completed=1,
        accent="255,94,0",
        subgoals=[
            Subgoal(name="Check-in for flight CA1832", done=1, total=1, state="Completed"),
            Subgoal(name="Confirm hotel reservation in Chaoyang District", done=0, total=1, state="Needs action"),
            Subgoal(name="Review schedule for morning client meeting", done=0, total=1, state="At risk"),
        ],
        taskLabels=["Flight check-in", "Hotel confirmation", "Client meeting schedule"],
        recommendation="Move the trip to tonight or make the client meeting remote to reduce the weather-delay risk.",
        basis=["Weather feed", "Flight status", "Calendar"],
        observations=[
            GoalObservation(
                type="weather",
                title="Weather warning",
                detail="Heavy rain and thunderstorm warning forecasted for Beijing Capital Airport (PEK) tomorrow morning.",
                source="Beijing weather feed",
                time="2m ago",
            ),
        ],
        prediction=GoalPrediction(
            probability=82,
            risk="HIGH RISK",
            title="A flight delay is likely to cause a missed morning meeting in Beijing.",
            impact="Client meeting",
            window="Tomorrow · 10:00 AM",
            confidence="High confidence",
        ),
        suggestions=[
            GoalSuggestion(
                id="earlier-flight",
                label="TRAVEL SAFEGUARD",
                title="Reschedule to tonight's 8:30 PM departure to arrive before the rainstorm.",
                action="Reschedule Flight",
                updates=0,
                options=["8:30 PM", "10:10 PM", "Compare all"],
            ),
        ],
    ),
    Goal(
        id="better-self",
        title="Become a Better Self",
        short="Better self",
        status="On track",
        progress=64,
        scheduleOffset=0,
        scheduledTime="09:00",
        description="Create sustainable progress across health, focused work, and continuous learning.",
        sources=9,
        memories=128,
        outputs=7,
        tasks=18,
        completed=11,
        accent="255,140,66",
        subgoals=[
            Subgoal(name="Healthy living", done=5, total=7, state="Active"),
            Subgoal(name="Healthy work", done=4, total=6, state="Active"),
            Subgoal(name="Learning advancement", done=2, total=5, state="Planning"),
        ],
        taskLabels=["Protect morning focus", "Complete strength session", "Review sleep pattern"],
        recommendation="Move tomorrow's focus block 30 minutes earlier based on your recent energy pattern.",
        basis=["Fitness", "Calendar", "12 memories"],
    ),
]

SEED_SOURCES: list[Source] = [
    Source(
        id="iphone",
        name="Xiaomi Phone",
        category="device",
        type="Personal device",
        method="Local device bridge",
        status="Connected",
        statusType="connected",
        lastSync="2m ago",
        assets="286 signals",
        scopes=["App activity", "Selected photos", "Device health"],
        purposes=["Daily context", "Goal support"],
        usedBy="Morning brief · 09:10",
    ),
    Source(
        id="calendar",
        name="Calendar",
        category="productivity",
        type="Calendar & productivity",
        method="Official API",
        status="Connected",
        statusType="connected",
        lastSync="Live",
        assets="18 upcoming events",
        scopes=["Event title", "Time & availability"],
        purposes=["Planning", "Reminders"],
        usedBy="Today plan · Now",
    ),
    Source(
        id="notion",
        name="Notion Workspace",
        category="productivity",
        type="Productivity service",
        method="MCP extension",
        status="Connected",
        statusType="connected",
        lastSync="14m ago",
        assets="62 pages",
        scopes=["Selected workspace"],
        purposes=["Project context"],
        usedBy="Weekly review · Yesterday",
    ),
]

INTEGRATION_CATALOG: list[IntegrationCatalogItem] = [
    IntegrationCatalogItem(
        id="google-calendar",
        name="Google Calendar",
        category="productivity",
        method="Official API",
        description="Sync events and availability for planning.",
        scopes=["Event title", "Time & availability"],
    ),
    IntegrationCatalogItem(
        id="notion",
        name="Notion",
        category="productivity",
        method="MCP extension",
        description="Import selected workspace pages.",
        scopes=["Selected workspace"],
    ),
]

SEED_TASKS: list[ExecutionTask] = [
    ExecutionTask(
        id="task-1",
        goalId="beijing-trip",
        name="Confirm hotel reservation in Chaoyang District",
        state="Needs action",
        subgoalName="Confirm hotel reservation in Chaoyang District",
    ),
    ExecutionTask(
        id="task-2",
        goalId="better-self",
        name="Protect morning focus",
        state="Active",
        subgoalName="Healthy work",
    ),
]

OVERVIEW_CLUSTERS: list[OverviewCluster] = [
    OverviewCluster(key="goals", title="Goal Management", count=32),
    OverviewCluster(key="data", title="Personal Data", count=42),
    OverviewCluster(key="memory", title="Long-term Memory", count=128),
]

OVERVIEW_ACTIVITY: list[ActivityItem] = [
    ActivityItem(
        id="act-1",
        label="Morning brief",
        detail="3 goals need attention today",
        route="goals",
        timestamp="09:10",
    ),
]

OVERVIEW_CALENDAR: list[CalendarTask] = [
    CalendarTask(id="cal-1", title="Client meeting", time="10:00", dayOffset=1),
]
