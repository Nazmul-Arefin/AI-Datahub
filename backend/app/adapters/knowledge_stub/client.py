"""Knowledge retrieval stub for RAG — post-sprint."""

from __future__ import annotations


class KnowledgeStubClient:
    async def search(self, query: str) -> dict:
        return {"query": query, "hits": [], "mode": "stub"}


knowledge_stub_client = KnowledgeStubClient()
