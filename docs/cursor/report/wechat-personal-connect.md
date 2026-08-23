# Personal WeChat via AstrBot (`weixin_oc`)

Weeple Import Data **微信 WeChat** is an **AstrBot** connector (not an API key, not wcferry).

## Why not wcferry

wcferry injects a Windows DLL into WeChat desktop 3.9.x. It cannot run in our Linux Docker stack, does not scale per-user, and `wcfhttp` is unmaintained. AstrBot’s native **个人微信** adapter (`weixin_oc`) uses Tencent `ilinkai.weixin.qq.com` with QR login + long polling inside the container.

## Phone requirement (tell the boss)

Personal WeChat QR login needs:

- iOS WeChat **≥ 8.0.70**, or
- Android WeChat **≥ 8.0.69** with ClawBot support

Test this first on the demo phone before the meeting.

## Connect flow

1. Stack up with AstrBot live (`ASTRBOT_MODE=live`, dashboard token set — see `astrbot-china-connect.md`).
2. Weeple → **Import Data** → **微信 WeChat** → **Connect**.
3. If AstrBot has no enabled `weixin_oc` bot yet, Weeple returns `setupRequired` and opens AstrBot **Platforms**.
4. In AstrBot: **Platforms → Add → 个人微信 (Personal WeChat)** → scan QR with phone WeChat → Save.
5. Click **Connect** again in Weeple. Source becomes **Connected**.

DeepSeek providers are already enabled in our AstrBot image, so inbound friend messages get LLM auto-replies once the adapter is live.

## Pause / Resume AI

Import Data **Pause AI use / Resume AI use** patches `aiEnabled` and also calls AstrBot:

`PATCH /api/v1/bots/{bot_id}/enabled` with `{"enabled": bool}`

so pausing actually stops auto-replies (not only a local flag).

## Sync

Sync verifies the messaging link (AstrBot platform status). It does **not** pull full chat history through Nango.

## Catalog wiring

| Layer | Value |
| --- | --- |
| `PLATFORM_SPECS["wechat"]` | `astrbot_type: weixin_oc` |
| Catalog `authType` | `astrbot` |
| Catalog `method` | `AstrBot` |
| Source id | `wechat` (Ready to connect until QR succeeds) |
