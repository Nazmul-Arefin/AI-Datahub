# Fix Google Calendar OAuth (Nango) — local

Error you saw: **Missing required parameter: scope**  
Cause: Nango’s `google-calendar` integration was created **without OAuth scopes** (and/or incomplete Google Cloud redirect URIs).

## A. Google Cloud Console (fix the OAuth client)

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Enable **Google Calendar API** (APIs & Services → Library).
3. Edit your **OAuth 2.0 Web client** (or create a new one if redirect URIs were empty).
4. **Authorized redirect URIs** — add exactly:
   ```
   http://localhost:3003/oauth/callback
   ```
   (Self-hosted Nango. Do **not** use only `https://api.nango.dev/oauth/callback` unless you use Nango Cloud.)
5. Optional JS origin: `http://localhost:3003`
6. **OAuth consent screen**
   - External + Testing is fine for local.
   - **Audience → Add test users** → add `hossen43420@gmail.com` (the account you sign in with).
   - **Data Access → Add scopes** (match Nango):
     - `https://www.googleapis.com/auth/calendar.readonly`  
       (or full `https://www.googleapis.com/auth/calendar` if you need write later)
     - `openid`
     - `https://www.googleapis.com/auth/userinfo.email`
7. Save. Copy **Client ID** + **Client Secret** into Nango (do not commit them; rotate if they were pasted into chat/screenshots).

## B. Nango dashboard (this is what fixes “missing scope”)

1. Open http://localhost:3003 → **Integrations** → **google-calendar**.
2. Set:
   - Client ID / Client Secret from Google
   - **Scopes** (required — empty scopes → Google Error 400):
     ```
     https://www.googleapis.com/auth/calendar.readonly,openid,https://www.googleapis.com/auth/userinfo.email
     ```
     (comma- or space-separated as the Nango UI expects)
3. Save the integration.

## C. Weeple Import Data (end-user Connect)

1. Catalog row is **Live** for `google-calendar` (`auth_type: nango`, `nango_provider_key: google-calendar`).
2. Restart API after backend changes: `docker compose restart api`
3. Open Weeple → **Import Data** → **Google Calendar** → **Connect**.
4. Nango Connect UI (`:3009`) opens embedded; user signs in with their Google account.
5. After success, the source becomes **Connected**. Use **Manage → Sync now** to pull events from **all selected calendars** (not only primary — includes Holidays, Family, etc.) for ~30 days past → 1 year ahead into `synced_assets`.
6. Catalog **Connect** hides once that source has a real Nango `connectionId`.

## Quick checklist

| Item | Value |
| --- | --- |
| Redirect URI | `http://localhost:3003/oauth/callback` |
| Nango scopes | calendar.readonly + openid + email |
| Test user | Your Gmail on consent screen |
| Catalog | `availability: live`, `nango_provider_key: google-calendar` |
| Source id | `calendar` (mapped from catalog `google-calendar`) |
| Sync API | `POST /api/v1/sources/calendar/sync` |

After scopes are saved in Nango, the Google popup must show requested permissions — not “Missing required parameter: scope”.
