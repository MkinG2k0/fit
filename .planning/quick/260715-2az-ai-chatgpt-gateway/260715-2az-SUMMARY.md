---
phase: 260715-2az-ai-chatgpt-gateway
plan: 01
subsystem: ai
tags: [openai, chatgpt, gateway, axios, recommendations, local-storage]

requires: []
provides:
  - AI gateway axios client (VITE_AI_GATEWAY_*)
  - Period filter + Russian workout log text builders
  - /ai-recommendations page with profile menu entry
affects: [ai-recommendations, analytics-storage]

tech-stack:
  added: []
  patterns:
    - Separate axios client for AI gateway (not $api)
    - Pure journal → Russian text helpers consumed by UI panel

key-files:
  created:
    - .env.example
    - src/shared/api/aiGateway.ts
    - src/features/aiRecommendations/model/types.ts
    - src/features/aiRecommendations/lib/filterDaysByPeriod.ts
    - src/features/aiRecommendations/lib/buildWorkoutLogText.ts
    - src/features/aiRecommendations/lib/prompts.ts
    - src/features/aiRecommendations/ui/AiRecommendationsPanel.tsx
    - src/features/aiRecommendations/index.ts
    - src/pages/AiRecommendationsPage/ui/AiRecommendationsPage.tsx
    - src/pages/AiRecommendationsPage/index.ts
  modified:
    - src/vite-env.d.ts
    - src/shared/api/index.ts
    - src/pages/index.ts
    - src/app/router/routes.tsx
    - src/app/layout/AppLayout.tsx
    - src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx
    - .env (local only — not committed)

key-decisions:
  - "Separate axios client for VITE_AI_GATEWAY_URL; model gpt-4o-mini; no streaming"
  - "Empty period skips API and shows Russian empty-state"
  - "Commit .env.example placeholders only; never stage real API keys"

patterns-established:
  - "Feature lib: filterDaysByPeriod → buildWorkoutLogText → prompts → createChatCompletion"

requirements-completed: [QUICK-2AZ-01, QUICK-2AZ-02, QUICK-2AZ-03]

coverage:
  - id: D1
    description: Four period options and AI recommendations panel UI
    requirement: QUICK-2AZ-01
    verification:
      - kind: other
        ref: "pnpm exec tsc --noEmit -p tsconfig.app.json (touched files clean)"
        status: pass
    human_judgment: true
    rationale: "Need gateway + sample journal data for end-to-end UI check"
  - id: D2
    description: Local journal text + POST /v1/chat/completions via gateway client
    requirement: QUICK-2AZ-02
    verification:
      - kind: other
        ref: "rg createChatCompletion|gpt-4o-mini|buildWorkoutLogText"
        status: pass
    human_judgment: true
    rationale: "Live gateway on localhost:3005 required for response validation"
  - id: D3
    description: Env, route /ai-recommendations, nav, empty/loading/error/success
    requirement: QUICK-2AZ-03
    verification:
      - kind: other
        ref: "rg ai-recommendations|AI рекомендации in routes/layout/menu"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-07-15
status: complete
---

# Phase 260715-2az Plan 01: AI ChatGPT Gateway Summary

**Экран «AI рекомендации» собирает локальный журнал в русский текст и запрашивает gpt-4o-mini через отдельный gateway-клиент на localhost:3005.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-14T22:43:00Z
- **Completed:** 2026-07-14T22:55:00Z
- **Tasks:** 3/3
- **Files modified:** 16 created/modified (`.env` local-only)

## Accomplishments

- Gateway client `createChatCompletion` → `POST /v1/chat/completions` with `gpt-4o-mini`, Bearer + X-API-Key when key set, typed Russian-safe errors.
- Period filter (`last_workout` / week / month / all) + Russian `вес × повторы` log text + beginner trainer prompts.
- Page `/ai-recommendations`, header title, profile menu (Sparkles), empty → skip API, loading/result/error UI.

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `0732af1` | Env placeholders, gateway client, prompts, period log builders |
| 2 | `5b74bb1` | AI recommendations period panel UI |
| 3 | `6063608` | Page, route, layout title, profile menu |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

### Notes

- Pre-existing `tsc` errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts` were out of scope (not introduced by this plan).
- `.env` updated locally with `VITE_AI_GATEWAY_URL` / `VITE_AI_GATEWAY_API_KEY` (copied from existing `API_KEY`); file left unstaged because it is tracked and may contain secrets. `.env.example` committed with placeholders only.

## Auth Gates

None.

## Known Stubs

None — no placeholder UI or unwired data paths that block the plan goal.

## Threat Flags

None beyond accepted T-2az-01 (VITE key in client bundle for local gateway).

## Verification Notes

- `pnpm exec tsc --noEmit -p tsconfig.app.json`: no errors in new AI feature files.
- Empty period path does not call gateway (early return before `createChatCompletion`).
- Manual E2E with gateway on `:3005` recommended when key + journal data available.
- No API key values appear in this SUMMARY or commit messages.

## Self-Check: PASSED

- FOUND: `.env.example`, `src/shared/api/aiGateway.ts`, `src/features/aiRecommendations/**`, `src/pages/AiRecommendationsPage/**`
- FOUND commits: `0732af1`, `5b74bb1`, `6063608`
