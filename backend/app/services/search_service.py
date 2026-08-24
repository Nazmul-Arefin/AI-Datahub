from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas.search import SearchHit, SearchResponse
from app.services.goal_service import goal_service
from app.services.memory_service import memory_service
from app.services.overview_service import overview_service
from app.services.source_service import source_service
from app.services.task_service import task_service


def _norm(value: object) -> str:
    return str(value or "").strip().lower()


def _score(text: str, query: str, tokens: list[str]) -> float:
    hay = _norm(text)
    if not hay or not query:
        return 0.0
    if query in hay:
        return 12.0 + min(4.0, len(query) / 8.0)
    if not tokens:
        return 0.0
    hits = sum(1 for token in tokens if token in hay)
    if not hits:
        return 0.0
    return (hits / len(tokens)) * 8.0


class SearchService:
    async def search(self, query: str, *, db: Session | None = None, limit: int = 20, user_id: str | None = None) -> SearchResponse:
        q = (query or "").strip()
        if not q:
            return SearchResponse(query="", total=0, items=[], summary="Type something to search Weeple.")

        tokens = [part for part in _norm(q).split() if len(part) > 1]
        needle = _norm(q)
        hits: list[SearchHit] = []

        goals = goal_service.list_goals(db=db, user_id=user_id).goals
        for goal in goals:
            blob = " ".join(
                filter(
                    None,
                    [
                        goal.title,
                        goal.short,
                        goal.description,
                        goal.category,
                        goal.status,
                        goal.recommendation,
                        " ".join(goal.basis or []),
                    ],
                )
            )
            score = _score(blob, needle, tokens)
            if score <= 0:
                continue
            hits.append(
                SearchHit(
                    id=goal.id or goal.title,
                    type="goal",
                    title=goal.title,
                    detail=goal.status or goal.category or goal.description,
                    route="goals",
                    score=score + 1.5,
                    meta={"goalId": goal.id, "progress": goal.progress},
                )
            )

        sources = source_service.list_sources(db=db, user_id=user_id).sources
        for source in sources:
            blob = " ".join(
                filter(
                    None,
                    [
                        source.name,
                        source.category,
                        source.type,
                        source.status,
                        " ".join(source.scopes or []),
                        " ".join(source.purposes or []),
                        source.used_by,
                    ],
                )
            )
            score = _score(blob, needle, tokens)
            if score <= 0:
                continue
            hits.append(
                SearchHit(
                    id=source.id,
                    type="source",
                    title=source.name,
                    detail=f"{source.category} · {source.status}",
                    route="import-data",
                    score=score + 1.0,
                    meta={"sourceId": source.id, "category": source.category},
                )
            )

        catalog = source_service.integration_catalog(q=q, db=db).items
        for item in catalog[:12]:
            blob = " ".join(filter(None, [item.name, item.category, item.description, item.id]))
            score = max(4.0, _score(blob, needle, tokens))
            hits.append(
                SearchHit(
                    id=item.id,
                    type="catalog",
                    title=item.name,
                    detail=f"Catalog · {item.category}",
                    route="import-data",
                    score=score,
                    meta={"catalogKey": item.id, "category": item.category},
                )
            )

        tasks = task_service.list_tasks(db=db, user_id=user_id).tasks
        for task in tasks:
            blob = " ".join(filter(None, [task.name, task.state, task.subgoal_name, task.owner, task.due_at]))
            score = _score(blob, needle, tokens)
            if score <= 0:
                continue
            hits.append(
                SearchHit(
                    id=task.id,
                    type="task",
                    title=task.name,
                    detail=f"{task.state} · {task.owner}",
                    route="goals" if task.goal_id else "overview",
                    score=score + 0.5,
                    meta={"taskId": task.id, "goalId": task.goal_id},
                )
            )

        overview = overview_service.get_overview(db=db, user_id=user_id)
        for item in overview.activity:
            blob = " ".join(filter(None, [item.label, item.detail, item.route]))
            score = _score(blob, needle, tokens)
            if score <= 0:
                continue
            route = item.route if item.route in {"overview", "goals", "import-data", "use-data", "data", "memory"} else "overview"
            if route == "data":
                route = "import-data"
            if route == "memory":
                route = "use-data"
            hits.append(
                SearchHit(
                    id=item.id,
                    type="activity",
                    title=item.label,
                    detail=item.detail,
                    route=route,
                    score=score,
                    meta={"activityId": item.id},
                )
            )

        try:
            memory_result = await memory_service.search(q)
            for memory in memory_result.get("items") or []:
                title = memory.get("title") or memory.get("id") or "Memory"
                content = memory.get("content") or memory.get("summary") or ""
                score = max(3.5, _score(f"{title} {content}", needle, tokens))
                hits.append(
                    SearchHit(
                        id=str(memory.get("id") or title),
                        type="memory",
                        title=str(title),
                        detail=(str(content)[:140] if content else memory.get("source")),
                        route="use-data",
                        score=score + 0.8,
                        meta={"memoryId": memory.get("id")},
                    )
                )
        except Exception:
            pass

        # De-dupe by type+id keeping highest score
        best: dict[tuple[str, str], SearchHit] = {}
        for hit in hits:
            key = (hit.type, hit.id)
            previous = best.get(key)
            if previous is None or hit.score > previous.score:
                best[key] = hit

        ranked = sorted(best.values(), key=lambda item: (-item.score, item.title.lower()))[: max(1, min(limit, 40))]
        summary = (
            f"Found {len(ranked)} result{'s' if len(ranked) != 1 else ''} across goals, data, tasks, and memory."
            if ranked
            else "No matches yet — try a goal name, source, or memory phrase."
        )
        return SearchResponse(query=q, total=len(ranked), items=ranked, summary=summary)


search_service = SearchService()
