from pathlib import Path

from app.schemas.settings import SystemSettings, SystemSettingsPatchRequest
from app.services.runtime_store import runtime_store

_SETTINGS_DIR = Path(__file__).resolve().parents[2] / "data" / "settings"


class SettingsService:
    def _path_for(self, user_id: str) -> Path:
        safe = "".join(ch for ch in str(user_id) if ch.isalnum() or ch in {"-", "_"}) or "default"
        return _SETTINGS_DIR / f"{safe}.json"

    def _load_file(self, user_id: str) -> SystemSettings | None:
        path = self._path_for(user_id)
        if not path.exists():
            return None
        try:
            return SystemSettings.model_validate_json(path.read_text(encoding="utf-8"))
        except Exception:
            return None

    def _save_file(self, user_id: str, settings: SystemSettings) -> None:
        _SETTINGS_DIR.mkdir(parents=True, exist_ok=True)
        path = self._path_for(user_id)
        path.write_text(
            settings.model_dump_json(by_alias=True, indent=2),
            encoding="utf-8",
        )

    def get_settings(self, user_id: str) -> SystemSettings:
        # File is the durable source of truth; refresh cache on every read.
        from_file = self._load_file(user_id)
        if from_file is not None:
            runtime_store.settings[user_id] = from_file.model_copy(deep=True)
            return from_file.model_copy(deep=True)
        stored = runtime_store.settings.get(user_id)
        if stored is not None:
            return stored.model_copy(deep=True)
        settings = SystemSettings()
        runtime_store.settings[user_id] = settings.model_copy(deep=True)
        return settings

    def patch_settings(self, user_id: str, payload: SystemSettingsPatchRequest) -> SystemSettings:
        current = self.get_settings(user_id)
        updates = payload.model_dump(exclude_none=True)
        previous_autonomy = current.autonomy
        merged = current.model_copy(update=updates)
        runtime_store.settings[user_id] = merged.model_copy(deep=True)
        self._save_file(user_id, merged)
        if "autonomy" in updates and updates["autonomy"] != previous_autonomy:
            from app.services.activity_service import activity_service

            activity_service.record(
                "Autonomy updated",
                f"AI autonomy set to “{merged.autonomy}”",
                route="overview",
            )
        return merged.model_copy(deep=True)

    def clear_cache(self, user_id: str | None = None) -> None:
        if user_id is None:
            runtime_store.settings.clear()
        else:
            runtime_store.settings.pop(user_id, None)


settings_service = SettingsService()
