---
phase: 01
slug: quick-logging-core-local-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (to be installed in Wave 0) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `pnpm vitest run --reporter=basic --passWithNoTests` |
| **Full suite command** | `pnpm vitest run --reporter=basic && pnpm lint` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=basic --passWithNoTests`
- **After every plan wave:** Run `pnpm vitest run --reporter=basic && pnpm lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | LOG-01, LOG-02 | T-01-01 | Invalid numeric inputs are blocked and never persisted | unit | `pnpm vitest run src/features/exercise/**/*.test.ts --reporter=basic` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | LOG-03 | T-01-02 | Edit/delete actions mutate only target set and preserve integrity | unit | `pnpm vitest run src/entities/calendarDay/**/*.test.ts --reporter=basic` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | LOG-04 | T-01-03 | Previous values shown from trusted store selector only | unit | `pnpm vitest run src/entities/**/selectors/**/*.test.ts --reporter=basic` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | DATA-01 | T-01-04 | Local save failures are handled gracefully and surfaced in UI | integration | `pnpm vitest run src/shared/lib/storage.test.ts --reporter=basic` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — add `vitest` and test script
- [ ] `vitest.config.ts` — baseline config for React + TS
- [ ] `src/test/setup.ts` — shared setup and mocks
- [ ] `src/entities/calendarDay/slice/calendarStore.test.ts` — store behavior stubs for LOG-02/LOG-03/DATA-01
- [ ] `src/shared/lib/storage.test.ts` — persistence failure and recovery stubs

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quick-log UX requires 1-2 actions on real screen | LOG-01 | Interaction speed and click count are UX-observable | Run app, log a set from Exercise page, verify max two interactions from exercise open to saved set |
| Suggestion chip copy and placement readability | LOG-04 | Visual emphasis/legibility cannot be fully asserted by unit tests | Open repeated exercise and confirm "Предыдущий: ..." appears near set input and is readable on mobile width |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
