from pydantic import BaseModel, Field, field_validator


class TokenRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: str | None = Field(default=None, alias="displayName")

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        cleaned = str(value or "").strip()
        if len(cleaned) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(cleaned) > 64:
            raise ValueError("Username must be at most 64 characters")
        if not cleaned.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, _ and -")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(str(value or "")) < 6:
            raise ValueError("Password must be at least 6 characters")
        return value

    @field_validator("display_name")
    @classmethod
    def normalize_display_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned[:120] or None


class TokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}


class UserProfile(BaseModel):
    id: str
    username: str | None = None
    display_name: str = Field(alias="displayName")

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}
