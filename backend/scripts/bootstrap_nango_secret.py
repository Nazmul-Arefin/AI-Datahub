"""Decrypt the local Nango env secret into backend/.env. Never prints the secret.

Usage (from backend/):
  python scripts/bootstrap_nango_secret.py
"""

from __future__ import annotations

import base64
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _env_value(name: str) -> str:
    text = (ROOT / ".env").read_text(encoding="utf-8")
    match = re.search(rf"^{name}=(.*)$", text, flags=re.M)
    return (match.group(1).strip() if match else "") or os.environ.get(name, "")


def _decrypt(secret: str, iv: str, tag: str, key_b64: str) -> str:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    key = base64.b64decode(key_b64)
    nonce = base64.b64decode(iv)
    ciphertext = base64.b64decode(secret)
    auth = base64.b64decode(tag)
    return AESGCM(key).decrypt(nonce, ciphertext + auth, None).decode("utf-8")


def _write_secret(secret: str) -> None:
    path = ROOT / ".env"
    text = path.read_text(encoding="utf-8")
    line = f"NANGO_SECRET_KEY={secret}"
    if re.search(r"^NANGO_SECRET_KEY=", text, flags=re.M):
        text = re.sub(r"^NANGO_SECRET_KEY=.*$", line, text, flags=re.M)
    else:
        text = text.rstrip() + "\n" + line + "\n"
    path.write_text(text, encoding="utf-8")


def main() -> int:
    enc_key = _env_value("NANGO_ENCRYPTION_KEY")
    if not enc_key:
        print("NANGO_ENCRYPTION_KEY missing in backend/.env")
        return 1
    sql = (
        "SELECT secret_key, coalesce(secret_key_iv,''), coalesce(secret_key_tag,'') "
        "FROM nango._nango_environments WHERE name='dev' AND deleted IS NOT TRUE LIMIT 1"
    )
    raw = subprocess.check_output(
        [
            "docker",
            "exec",
            "ai-datahub-nango-db-1",
            "psql",
            "-U",
            "nango",
            "-d",
            "nango",
            "-t",
            "-A",
            "-F",
            "|",
            "-c",
            sql,
        ],
        text=True,
    ).strip()
    if not raw:
        print("no nango dev environment row")
        return 1
    secret, iv, tag = raw.split("|", 2)
    plaintext = secret if not iv else _decrypt(secret, iv, tag, enc_key)
    _write_secret(plaintext)
    print(f"nango_secret_key_saved length={len(plaintext)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
