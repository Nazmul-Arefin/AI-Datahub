"""Assemble goal + source + memory context for agent runs."""


class ContextBuilder:
    def build(self, *, goal_id: str | None = None, source_ids: list[str] | None = None) -> dict:
        return {
            "goalId": goal_id,
            "sourceIds": source_ids or [],
            "snippets": [],
        }


context_builder = ContextBuilder()
