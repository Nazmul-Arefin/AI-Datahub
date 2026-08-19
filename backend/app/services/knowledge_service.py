"""RAG interface — stub only for this sprint."""

from app.adapters.knowledge_stub import knowledge_stub_client


class KnowledgeService:
    def __init__(self, client=knowledge_stub_client) -> None:
        self._client = client

    async def search(self, query: str) -> dict:
        return await self._client.search(query)


knowledge_service = KnowledgeService()
