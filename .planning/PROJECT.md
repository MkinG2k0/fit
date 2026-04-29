# Fit

## What This Is

Fit is a workout tracking web app focused on fast logging for beginners in the gym. The main use case is to quickly record exercises and sets with weight and reps, then review progress over time. The current version works locally in the browser, with account-based sync planned for later.

## Core Value

A beginner can log each workout quickly and clearly, and see measurable progress in weight and reps without friction.

## Requirements

### Validated

- ✓ User can create and edit exercises and presets in the current app — existing codebase
- ✓ User can log workouts by date and manage sets inside exercises — existing codebase
- ✓ User can persist workout history locally in browser storage — existing codebase

### Active

- [ ] User can log a workout with exercise -> sets -> weight/reps as the primary flow
- [ ] User can view progress charts by weight and reps for selected exercises
- [ ] User can use a clear category list for organizing and selecting exercises
- [ ] User can use the app fully as web-first with local-only storage in v1

### Out of Scope

- Multi-device cloud sync in v1 — account system is planned for later
- Social/sharing features in v1 — not part of the core quick-log value
- Native mobile apps in v1 — web-first delivery has higher priority

## Context

This is a brownfield frontend project with existing React + TypeScript + Zustand architecture and local persistence. Core training flows already exist (calendar days, exercises, sets, presets), so the next scope should improve beginner clarity and progression visibility instead of rebuilding fundamentals. The app currently has sufficient structure to expand features incrementally within FSD-style layers.

## Constraints

- **Platform**: Web-first release — user wants browser usage now, native app later
- **Storage**: Local-first in v1 — auth/account sync deferred
- **Audience**: Beginners — UX must prioritize clarity and low cognitive load
- **Progress Metrics**: Weight and reps only — avoid extra complexity (RPE/rest) in v1

## Key Decisions

| Decision                                     | Rationale                                                         | Outcome   |
| -------------------------------------------- | ----------------------------------------------------------------- | --------- |
| Prioritize "quick log" as primary flow       | User explicitly selected fast recording as most important journey | — Pending |
| Track set data with weight + reps only in v1 | Keeps input fast and beginner-friendly                            | — Pending |
| Include progress charts in v1                | User wants visible progress by weight/reps                        | — Pending |
| Keep v1 local-only (no auth required yet)    | Reduces scope and ships value faster                              | — Pending |
| Ship web first, mobile app later             | Matches current usage expectation and existing stack              | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-14 after initialization_
