# Gmail via Nango (`google-mail`) — local setup

Gmail is a **Live** Nango connector (`nango_provider_key: google-mail`) with read sync into `synced_assets` and a confirm-gated send API.

## A. Google Cloud Console

1. Open [Credentials](https://console.cloud.google.com/apis/credentials).
2. Enable **Gmail API**.
3. Edit (or create) your **OAuth 2.0 Web client**.
4. **Authorized redirect URIs** — add:
   ```
   http://localhost:3003/oauth/callback
   ```
5. **OAuth consent screen → Data Access** — add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Add your Google account as a **test user**.
7. Copy Client ID + Client Secret into Nango (never commit them).

## B. Nango dashboard

1. Open http://localhost:3003 → **Integrations**.
2. Create / open **`google-mail`** (provider Google Mail).
3. Set Client ID / Secret from Google.
4. Scopes (required — empty scopes → Google Error 400):
   ```
   https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,openid,https://www.googleapis.com/auth/userinfo.email
   ```
5. Redirect URI must match Google: `http://localhost:3003/oauth/callback`.
6. Save.

## C. Weeple Connect + Sync

1. Catalog row: **Gmail** · Live · Nango · `google-mail`.
2. Restart API after backend changes: `docker compose restart api`.
3. Import Data → **Gmail** → **Connect** (Nango Connect UI).
4. After Connected → **Sync now** pulls recent messages (`newer_than:30d`, metadata headers) into `synced_assets` as `email_message`.

## D. Send (confirm-gated)

```
POST /api/v1/sources/gmail/send
{ "to": "user@example.com", "subject": "Hello", "body": "Hi", "confirm": true }
```

Without `confirm: true` the API rejects the call. Agents get the same gate via MCP tool `send_email` (`confirmationRequired: true`).

## Checklist

| Item | Value |
| --- | --- |
| Redirect URI | `http://localhost:3003/oauth/callback` |
| Nango integration | `google-mail` |
| Scopes | gmail.readonly + gmail.send + openid + email |
| Source id | `gmail` |
| Sync | `POST /api/v1/sources/gmail/sync` |
| Send | `POST /api/v1/sources/gmail/send` + `confirm: true` |
