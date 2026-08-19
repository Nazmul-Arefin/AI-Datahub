"""TencentDB Agent Memory HTTP adapter — official local Memory Core API.

Core (agentmemory/memory-core) speaks:
  POST /capture  {user_content, assistant_content, session_key}
  POST /search/memories  {query}  → {results, total, strategy}
  POST /recall  {query, session_key}

It does not implement REST /memories CRUD. Capture is L0 conversation log;
extraction is async, so this adapter keeps a write-through index keyed by
session_key so store → recall works on the same API process.
"""

from __future__ import annotations

import json
from pathlib import Path
from uuid import uuid4

import httpx

from app.core.config import settings

_BACKEND_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_INDEX = _BACKEND_ROOT / "data" / "memory_index.jsonl"
_EMPTY_SEARCH_MARKERS = ("no matching", "not found", "no memories")


def normalize_memory_item(
    item: object,
    *,
    fallback_id: str | None = None,
    fallback_title: str | None = None,
    mode: str = "live",
) -> dict | None:
    """Map a Core/sidecar payload into MemoryRecord fields. Never wrap search envelopes."""
    if not isinstance(item, dict):
        return None
    if "results" in item and "id" not in item and "content" not in item and "title" not in item:
        return None
    rec_id = (
        item.get("id")
        or item.get("memoryId")
        or item.get("session_key")
        or item.get("sessionId")
        or fallback_id
    )
    if not rec_id:
        return None
    content = item.get("content") or item.get("text") or item.get("snippet") or item.get("context")
    title = item.get("title") or fallback_title or str(rec_id)
    if content is None:
        content = ""
    return {
        "id": str(rec_id),
        "title": str(title),
        "content": str(content),
        "source": item.get("source"),
        "mode": item.get("mode") or mode,
    }


def parse_search_payload(data: object) -> list[dict]:
    """Turn Core search JSON into MemoryRecord dicts. String `results` is not an item."""
    if isinstance(data, list):
        return [row for item in data if (row := normalize_memory_item(item))]
    if not isinstance(data, dict):
        return []
    results = data.get("results")
    if isinstance(results, str):
        lowered = results.lower()
        if not results.strip() or any(marker in lowered for marker in _EMPTY_SEARCH_MARKERS):
            return []
        return []
    if isinstance(results, list):
        return [row for item in results if (row := normalize_memory_item(item))]
    for key in ("items", "memories", "data"):
        value = data.get(key)
        if isinstance(value, list):
            return [row for item in value if (row := normalize_memory_item(item))]
    return []


class TencentMemoryClient:
    def __init__(
        self,
        base_url: str | None = None,
        transport: httpx.BaseTransport | httpx.AsyncBaseTransport | None = None,
        index_path: Path | None = _DEFAULT_INDEX,
    ) -> None:
        self.base_url = (base_url or settings.memory_service_url).rstrip("/")
        self._transport = transport
        self._index_path = index_path
        self._index: dict[str, dict] = {}
        self._load_index()

    def _load_index(self) -> None:
        if not self._index_path or not self._index_path.is_file():
            return
        for line in self._index_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            rec_id = item.get("id") if isinstance(item, dict) else None
            if rec_id:
                self._index[str(rec_id)] = item

    def _persist_index(self) -> None:
        if not self._index_path:
            return
        self._index_path.parent.mkdir(parents=True, exist_ok=True)
        with self._index_path.open("w", encoding="utf-8") as handle:
            for record in self._index.values():
                handle.write(json.dumps(record, default=str) + "\n")

    def _client(self) -> httpx.AsyncClient:
        kwargs: dict = {"timeout": 20.0}
        if self._transport is not None:
            kwargs["transport"] = self._transport
        return httpx.AsyncClient(**kwargs)

    def _record(self, *, memory_id: str, title: str, content: str, source: str | None) -> dict:
        return {
            "id": memory_id,
            "title": title,
            "content": content,
            "source": source,
            "mode": "live",
        }

    async def _capture(self, client: httpx.AsyncClient, *, memory_id: str, title: str, content: str, source: str | None) -> None:
        payload = {
            "user_content": f"{title}\n{content}".strip(),
            "assistant_content": f"Acknowledged memory '{title}' from {source or 'app'}.",
            "session_key": memory_id,
        }
        response = await client.post(f"{self.base_url}/capture", json=payload)
        response.raise_for_status()

    async def store(self, *, title: str, content: str, source: str | None = None) -> dict:
        memory_id = f"mem-{uuid4().hex[:12]}"
        async with self._client() as client:
            await self._capture(client, memory_id=memory_id, title=title, content=content, source=source)
        record = self._record(memory_id=memory_id, title=title, content=content, source=source)
        self._index[memory_id] = dict(record)
        self._persist_index()
        return dict(record)

    async def recall(self, memory_id: str) -> dict | None:
        """Return only a stored row. Never treat Core /recall context as that id (B10)."""
        cached = self._index.get(memory_id)
        if cached:
            return dict(cached)
        async with self._client() as client:
            by_id = await client.get(f"{self.base_url}/memories/{memory_id}")
        if by_id.status_code != 200:
            return None
        mapped = normalize_memory_item(by_id.json() if by_id.content else {})
        if mapped and mapped.get("id") == memory_id:
            return mapped
        return None

    async def search(self, query: str) -> list[dict]:
        needle = (query or "").lower()
        items: list[dict] = []
        seen: set[str] = set()
        for record in self._index.values():
            blob = f"{record.get('title', '')} {record.get('content', '')}".lower()
            if not needle or needle in blob or needle in str(record.get("id", "")).lower():
                items.append(dict(record))
                seen.add(record["id"])
        if not query:
            return items
        try:
            async with self._client() as client:
                response = await client.post(
                    f"{self.base_url}/search/memories",
                    json={"query": query},
                )
                if response.status_code >= 400:
                    return items
                data = response.json() if response.content else {}
        except httpx.HTTPError:
            return items
        for row in parse_search_payload(data):
            if row["id"] not in seen:
                items.append(row)
                seen.add(row["id"])
        return items

    async def update(self, memory_id: str, **fields: str) -> dict | None:
        current = self._index.get(memory_id)
        if not current:
            return None
        allowed = {"title", "content", "source"}
        merged = dict(current)
        for key, value in fields.items():
            if key in allowed and value is not None:
                merged[key] = value
        async with self._client() as client:
            await self._capture(
                client,
                memory_id=memory_id,
                title=str(merged["title"]),
                content=str(merged.get("content") or ""),
                source=merged.get("source"),
            )
        record = self._record(
            memory_id=memory_id,
            title=str(merged["title"]),
            content=str(merged.get("content") or ""),
            source=merged.get("source"),
        )
        self._index[memory_id] = dict(record)
        self._persist_index()
        return dict(record)

    async def delete(self, memory_id: str) -> bool:
        existed = self._index.pop(memory_id, None) is not None
        if existed:
            self._persist_index()
        async with self._client() as client:
            response = await client.delete(f"{self.base_url}/memories/{memory_id}")
        return existed or response.status_code < 400


tencent_memory_client = TencentMemoryClient()
