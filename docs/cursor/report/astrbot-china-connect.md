# AstrBot China connectors (飞书 / 钉钉 / 企微 / QQ)

Weeple Import Data cards with **method = AstrBot** route through `MessagingService` → AstrBot (`:6185`). Users click **Connect** in Weeple; if the bot is not registered yet, a setup overlay opens AstrBot **Platforms** (`http://localhost:6185/#/platforms`). End users should not see AstrBot branding in Weeple — it is an internal sidecar.

## What you must do once (admin / local stack)

1. Ensure AstrBot is running (`docker compose` → `http://localhost:6185`).
2. Open `http://localhost:6185/` (not `/#/bots` — that route does not exist and shows a blank page). Log in with the password from first-run / container logs.
3. Set `ASTRBOT_DASHBOARD_TOKEN` in `backend/.env` (see below).
4. Restart the API so it can list/create platforms.

### How to get `ASTRBOT_DASHBOARD_TOKEN`

1. Log into `http://localhost:6185/` so the dashboard loads.
2. Open DevTools → **Application** (Chrome) / **Storage** (Firefox) → **Local Storage** → `http://localhost:6185`.
3. Copy the value of the `token` key (JWT).
4. Paste into `backend/.env` as `ASTRBOT_DASHBOARD_TOKEN=...` (never commit it).
5. `docker compose up -d api --force-recreate` (or restart API) so the container picks up `.env`.

The JWT lasts ~7 days; when dashboard API calls start returning 401, refresh it the same way.

Optional env (only if you already have developer credentials and want auto-register without QR):

| App | Env vars |
| --- | --- |
| 飞书 | `FEISHU_APP_ID`, `FEISHU_APP_SECRET`, `FEISHU_DOMAIN` |
| 钉钉 | `DINGTALK_CLIENT_ID`, `DINGTALK_CLIENT_SECRET` |
| 企微 | `WECOM_CORPID`, `WECOM_SECRET`, `WECOM_TOKEN`, `WECOM_ENCODING_AES_KEY` |
| 企微智能机器人 | `WECOM_AI_TOKEN`, `WECOM_AI_ENCODING_AES_KEY` |
| QQ | `QQ_APPID`, `QQ_SECRET` |
| Telegram | `TELEGRAM_BOT_TOKEN` (already supported) |

**Prefer AstrBot One-click QR** for 飞书 / 钉钉. Env credentials are a power-user path.

## Real use (Feishu after Connect)

| Path | What happens |
| --- | --- |
| **Inbound chat** | User texts the Feishu bot → AstrBot LLM replies in Feishu (messaging). |
| **Sync now in Weeple** | API uses the lark adapter’s `app_id`/`app_secret` (server-side only) → Feishu Open API → chats + recent messages (+ calendar if scoped) → `synced_assets`. |
| **Send from Weeple** | `POST /api/v1/messaging/messages` with `{ "platform": "feishu", "threadId": "<chat_id>", "content": "…" }`. |

Docs Drive/wiki sync still needs extra Feishu app scopes + a follow-up importer. Calendar appears only if the Feishu app has calendar permission.

**Never** put Feishu `app_secret` in the frontend or commit it; AstrBot’s platform API returns secrets — Weeple strips them from all public responses.

1. Import Data → filter **China** / search 飞书 or 钉钉 → **Connect**.
2. If AstrBot already has an enabled platform → Weeple finishes immediately (callback → source connected).
3. If not → overlay: **Open setup page** → Platforms → Add / QR → return → **I’ve set it up** → Connect again.

## Per-app notes

| Catalog id | AstrBot type | Best path |
| --- | --- | --- |
| `feishu` | `lark` | Platforms → Add → lark → One-click QR |
| `dingtalk` | `dingtalk` | Platforms → Add → DingTalk → One-click QR |
| `wecom` | `wecom` | App / CS credentials; often needs a public webhook URL |
| `wecom-ai` | `wecom_ai_bot` | Token + EncodingAESKey from 企微智能机器人 |
| `qq` | `qq_official` | AppID + Secret from QQ open platform |
| `telegram` | `telegram` | BotFather token in env or AstrBot form |
| `discord` | `discord` | Bot token in AstrBot |

微信个人号 (`wechat`) is **not** AstrBot in this catalog (no official personal WeChat bot path). Keep it as future API-key / partner relay.

## If Create Bot fails for lark / dingtalk

Your AstrBot image may only expose a subset of adapters in `GET /api/v1/bot-types` (e.g. telegram + wecom_ai_bot). If `lark` / `dingtalk` are missing:

1. Update AstrBot / install the platform plugin that registers those types.
2. Or configure the bot only in the AstrBot UI once types appear.
3. Weeple will keep returning `setupRequired` until an enabled bot of that `type` exists.

## AstrBot “Add MCP Server” vs app Connect

| Feature | What it does | User “2–3 click connect”? |
| --- | --- | --- |
| **Extensions → MCP** | Registers tool servers the *agent* can call | No — admin/dev tooling for the bot |
| **Platforms → Add** | Links 飞书/钉钉/企微/QQ to AstrBot | Yes — this is the real app link |
| **Weeple Import → Connect** | Detects AstrBot bot + records source | Yes — after the bot exists |

Adding more MCP servers helps agents use more tools; it does **not** OAuth-connect a user’s Taobao / Douyin / Netdisk. Those stay Nango / API-key / coming soon.

## Verify

```powershell
# Platforms known to Weeple
curl http://localhost:8000/api/v1/messaging/platforms

# Catalog rows
curl "http://localhost:8000/api/v1/integrations/catalog?q=feishu"

# Connect (expect setupRequired until bot exists in live mode)
curl -X POST "http://localhost:8000/api/v1/integrations/feishu/connect"
```
