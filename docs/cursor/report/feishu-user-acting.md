# Feishu: bot vs “act as the user”

## What works today (AstrBot **bot** identity)

| Capability | Status | Why |
| --- | --- | --- |
| Reply when user texts the bot | Works | AstrBot lark adapter |
| Sync group chats / messages bot can see | Works | `tenant_access_token` + IM scopes |
| Sync calendar events | Blocked until scopes | App needs `calendar:calendar:readonly` (or similar) |
| Sync docs / drive files | Blocked until scopes | App needs `drive:drive:readonly` (or `drive:drive`). `docx:document:readonly` alone cannot list folders |
| Send message **as the bot** | Possible | Scope `im:message:send_as_bot` |
| Send message **as the human user** | **Not possible with AstrBot bot** | Bot token ≠ user identity |

After Sync, capability rows in `synced_assets` explain missing calendar/docs scopes instead of failing silently.

### Enable calendar + docs for the **bot** (still bot identity)

1. Open [Feishu Open Platform](https://open.feishu.cn/app) → your app (`cli_…`).
2. **Permissions** → add and publish:
   - `calendar:calendar:readonly` (or `calendar:calendar`)
   - `drive:drive:readonly` (or `drive:drive`)
3. Re-publish the app / approve admin consent.
4. Weeple → Feishu → **Sync now**.

This still reads **as the app/bot**, not as the user’s private calendar/docs unless those are shared with the bot.

---

## Product goal: act **on behalf of the user**

> “See the goal → analyze → take action as the user (e.g. message contacts as me, not as a bot).”

That requires **Feishu User OAuth** (`user_access_token` + refresh), not AstrBot’s bot adapter.

```
User clicks Connect (User OAuth)
  → Feishu authorize (scopes: im, calendar, drive, offline_access)
  → Weeple stores user token (server-side only)
  → Agent actions use user_access_token
  → Messages appear FROM the user
```

| Approach | Identity | Good for |
| --- | --- | --- |
| AstrBot Platforms (current) | Bot | Chat assistant in Feishu, bot-visible groups |
| Feishu **User OAuth** (needed) | User | Goal agent: send mail/IM, edit calendar/docs as the person |
| Both | Dual | Bot for inbound assistant + OAuth for autonomous user actions |

### Recommended Weeple architecture

1. Keep AstrBot for **inbound bot chat** (optional UX channel).
2. Add **Feishu User Connect** (Nango Feishu/Lark if available, or first-party OAuth like Notion).
3. Agent tool `send_feishu_message` / `create_calendar_event` uses **user** token; high-impact tools require confirm=true.
4. Never show AstrBot branding to end users; never put tokens in the frontend.

### Effort (honest)

- Turn on calendar/docs for bot sync: **hours** (console scopes + Sync).
- Full “act as user” OAuth + agent tools: **~1–2 weeks** for Feishu alone (same class as Notion, but custom if Nango has no Feishu).

AstrBot cannot be stretched into “send as user”; that would still be the bot speaking.
