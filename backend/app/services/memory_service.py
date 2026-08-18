"""Long-term memory proposals — wire to memory_tencent adapter."""


class MemoryService:
    async def list_proposals(self) -> dict:
        return {
            "proposals": [
                {
                    "id": "mem-1",
                    "title": "Preferred morning focus window",
                    "summary": "User completes deep work best between 8:30 and 10:00.",
                    "source": "Calendar + fitness",
                    "confidence": 0.82,
                }
            ],
            "total": 1,
        }


memory_service = MemoryService()
