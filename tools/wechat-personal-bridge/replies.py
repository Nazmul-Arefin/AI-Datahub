"""Reply generators: safe template + optional DeepSeek LLM."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


def template_reply(text: str) -> str:
    return (text or "").strip()


def llm_reply(
    user_text: str,
    *,
    system_prompt: str,
    base_url: str,
    model: str,
    api_key: str | None = None,
    timeout: float = 20.0,
) -> str:
    key = (api_key or os.environ.get("DEEPSEEK_API_KEY") or "").strip()
    if not key:
        raise RuntimeError("DEEPSEEK_API_KEY missing — refusing LLM reply")

    url = base_url.rstrip("/") + "/chat/completions"
    payload: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text[:1500]},
        ],
        "temperature": 0.3,
        "max_tokens": 120,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(f"LLM HTTP {exc.code}: {detail}") from exc

    choices = body.get("choices") or []
    if not choices:
        raise RuntimeError("LLM returned no choices")
    content = (((choices[0] or {}).get("message") or {}).get("content") or "").strip()
    if not content:
        raise RuntimeError("LLM empty content")
    return content
