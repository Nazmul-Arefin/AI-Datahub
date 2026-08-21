"""Coze CN workflow adapter for goal cover image generation."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_IMAGE_URL_RE = re.compile(
    r"https?://[^\s\"'<>\)]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s\"'<>\)]*)?",
    re.IGNORECASE,
)
_MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\((https?://[^)\s]+)\)", re.IGNORECASE)
_ANY_HTTPS_RE = re.compile(r"https?://[^\s\"'<>\)]+", re.IGNORECASE)

_CATEGORY_MOOD = {
    "Travel": "travel destination atmosphere, journey and arrival",
    "Wellbeing": "calm wellness and healthy daily rhythm",
    "Learning": "focused study and skill practice",
    "Finance": "thoughtful personal finance and planning",
    "Relationships": "warm human connection and shared moments",
    "Project": "making and shipping a tangible project",
}


def build_goal_image_prompt(
    *,
    title: str,
    category: str | None = None,
    description: str | None = None,
    short: str | None = None,
) -> str:
    cat = (category or "Project").strip() or "Project"
    mood = _CATEGORY_MOOD.get(cat, _CATEGORY_MOOD["Project"])
    detail = (description or short or "").strip()
    subject = title.strip() or "personal goal"
    parts = [
        f"Editorial photograph for a personal AI OS goal cover about: {subject}.",
        f"Category mood: {mood}.",
    ]
    if detail:
        parts.append(f"Context: {detail[:180]}.")
    parts.append(
        "Soft natural light, cream and warm orange accents, shallow depth of field, "
        "wide cinematic hero composition, realistic photography, no text, no logos, "
        "no watermarks, no purple neon AI aesthetic."
    )
    prompt = " ".join(parts)
    return prompt[:480]


def extract_image_url(text: str | None) -> str | None:
    if not text:
        return None
    md = _MARKDOWN_IMAGE_RE.search(text)
    if md:
        return md.group(1).rstrip(".,;)")
    match = _IMAGE_URL_RE.search(text)
    if match:
        return match.group(0).rstrip(".,;)")
    # Coze sometimes returns CDN URLs without a file extension in the path.
    candidates = _ANY_HTTPS_RE.findall(text)
    for candidate in candidates:
        lower = candidate.lower()
        if any(token in lower for token in ("coze", "byteimg", "bytednsdoc", "tos-", "image", "img", "cdn")):
            return candidate.rstrip(".,;)")
    # Last resort: first https URL in the workflow message.
    if candidates:
        return candidates[0].rstrip(".,;)")
    return None


def _workflow_parameters(prompt: str) -> dict[str, str]:
    """Build start-node params; include common aliases so mismatched keys still work."""
    primary = (settings.coze_workflow_input_key or "input").strip() or "input"
    params = {primary: prompt}
    for alias in ("input", "prompt", "BOT_USER_INPUT", "query", "text"):
        params.setdefault(alias, prompt)
    return params


def _collect_message_text(payload: Any) -> str:
    if payload is None:
        return ""
    if isinstance(payload, str):
        return payload
    if isinstance(payload, dict):
        chunks: list[str] = []
        for key in ("content", "message", "output", "text", "data"):
            value = payload.get(key)
            if isinstance(value, str):
                chunks.append(value)
            elif value is not None:
                chunks.append(_collect_message_text(value))
        if not chunks:
            chunks.append(json.dumps(payload, ensure_ascii=False))
        return "\n".join(chunks)
    return str(payload)


def _generate_with_cozepy(prompt: str) -> str | None:
    try:
        from cozepy import COZE_CN_BASE_URL, Coze, TokenAuth, WorkflowEventType
    except ImportError:
        return None

    base = (settings.coze_api_base or COZE_CN_BASE_URL).rstrip("/")
    coze = Coze(auth=TokenAuth(token=settings.coze_api_token), base_url=base)
    parameters = _workflow_parameters(prompt)
    stream = coze.workflows.runs.stream(
        workflow_id=settings.coze_workflow_id,
        parameters=parameters,
    )
    chunks: list[str] = []
    for event in stream:
        if event.event == WorkflowEventType.MESSAGE and event.message is not None:
            content = getattr(event.message, "content", None) or ""
            chunks.append(str(content))
            found = extract_image_url(content)
            if found:
                return found
        elif event.event == WorkflowEventType.ERROR:
            logger.warning("Coze workflow error: %s", event.error)
            return None
    return extract_image_url("\n".join(chunks))


def _generate_with_httpx(prompt: str) -> str | None:
    """SSE fallback for Coze workflow stream_run without cozepy installed."""
    base = settings.coze_api_base.rstrip("/")
    url = f"{base}/v1/workflow/stream_run"
    headers = {
        "Authorization": f"Bearer {settings.coze_api_token}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    body = {
        "workflow_id": settings.coze_workflow_id,
        "parameters": _workflow_parameters(prompt),
    }
    chunks: list[str] = []
    with httpx.Client(timeout=120.0) as client:
        with client.stream("POST", url, headers=headers, json=body) as response:
            response.raise_for_status()
            event_name = "message"
            data_lines: list[str] = []
            for raw in response.iter_lines():
                if raw is None:
                    continue
                line = raw.strip() if isinstance(raw, str) else raw.decode("utf-8", errors="ignore").strip()
                if not line:
                    if data_lines:
                        payload_text = "\n".join(data_lines)
                        data_lines = []
                        if event_name in {"Error", "error"}:
                            logger.warning("Coze SSE error: %s", payload_text)
                            return None
                        try:
                            payload = json.loads(payload_text)
                        except json.JSONDecodeError:
                            payload = payload_text
                        text = _collect_message_text(payload)
                        chunks.append(text)
                        found = extract_image_url(text)
                        if found:
                            return found
                    event_name = "message"
                    continue
                if line.startswith("event:"):
                    event_name = line[6:].strip()
                elif line.startswith("data:"):
                    data_lines.append(line[5:].strip())
    return extract_image_url("\n".join(chunks))


def generate_goal_image(prompt: str) -> str | None:
    """Run the configured Coze workflow and return an image URL, or None."""
    if not settings.coze_enabled:
        logger.warning(
            "Coze artwork disabled — set COZE_API_TOKEN and COZE_MODE=live in backend/.env"
        )
        return None
    prompt = (prompt or "").strip()
    if not prompt:
        return None
    logger.info("Coze artwork starting for prompt (%s chars)", len(prompt))
    try:
        url = _generate_with_cozepy(prompt)
        if url:
            logger.info("Coze artwork URL from cozepy")
            return url
        url = _generate_with_httpx(prompt)
        if url:
            logger.info("Coze artwork URL from httpx SSE")
        else:
            logger.warning("Coze workflow finished without a parseable image URL")
        return url
    except Exception:
        logger.exception("Coze goal image generation failed")
        return None
