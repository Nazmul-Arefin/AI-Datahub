# Developer 2 — current status (todo)

**You:** Developer 2 (AI + sidecars)  
**Today:** 2026-08-19  
**Now working on:** nothing — Dev2 sprint tasks **T0–T9** are done  
**Reports:** [report/README.md](report/README.md) · **Local stack:** [LOCAL-STACK.md](LOCAL-STACK.md)

How to read this file:

- `[x]` completed  
- `[ ]` **NOW** ← currently in progress  
- `[ ]` not started  

---

## Completed

- [x] **T0** Plan + Cursor rules — [report/T0.md](report/T0.md)
- [x] **T1** Sidecar health — [report/T1.md](report/T1.md)
- [x] **T2** Mock facades — [report/T2.md](report/T2.md)
- [x] **T3** LLM ping (deepseek-v4-pro) — [report/T3.md](report/T3.md)
- [x] **T4** Memory store/recall — [report/T4.md](report/T4.md)
- [x] **Real stack** — [report/T-stack.md](report/T-stack.md)
- [x] **T5** AuthConnector + **live Nango** Connect URL — [report/T5.md](report/T5.md)
- [x] **T6** MCP registry + gateway invoke stub — [report/T6.md](report/T6.md)
- [x] **T7** ContextBuilder + AgentService → Harness — [report/T7.md](report/T7.md)
- [x] **T8** AstrBot one-platform connect — [report/T8.md](report/T8.md)
- [x] **T9** Bulk MCP register + vertical-slice smoke — [report/T9.md](report/T9.md)

---

## In progress

_(empty — sprint board complete.)_

---

## Left to do (in order)

_(none)_

---

## Not our work (Dev1 or out of sprint)

- [ ] Auth, goals, tasks, overview, catalog seed, Postgres models — **Dev1**
- [ ] 900 live Nango providers — out of sprint
- [ ] RAG / collaboration / AstrBot as Goals brain — do not do

---

## Daily submit (last)

| Date | Task | Result |
|------|------|--------|
| 2026-08-19 | T9 | Added 12 connectors without new routers; vertical slice smoke ok |
| 2026-08-19 | T8 | Telegram connect card + MCP row; high-impact `send_message` needs confirm |
| 2026-08-19 | T7 | Live Harness session from `POST /agents/runs` (context + events) |
| 2026-08-19 | T6 | Live MCP register + `list_repos` invoke; AgentService lists tools with no tokens |
| 2026-08-18 | T5 | Live Nango Connect URL from `POST /api/v1/integrations/connect` |
