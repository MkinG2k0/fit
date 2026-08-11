---
phase: 260811-tqu-optional-menu-features
plan: 01
subsystem: ui
tags: [zustand, settings, feature-flags, profile-menu, persist]

requires:
  - phase: 260715-3t7-ai-fill-feature-flag
    provides: "aiFillEnabled pattern for settings flag + persist + transfer"
provides:
  - "Four optional menu visibility flags (default false) in userStore"
  - "Settings card «Дополнительные разделы» with four checkboxes"
  - "Conditional profile menu items for timer/body-metrics/load-table/activity"
  - "userProfile export/import includes the four menu flags"
affects: [profile-menu, settings, app-settings-transfer]

tech-stack:
  added: []
  patterns:
    - "Optional menu sections gated by userStore boolean flags (default OFF)"
    - "Settings checkbox card mirrors ExerciseCardDisplaySettingsCard multi-row pattern"

key-files:
  created:
    - src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx
  modified:
    - src/entities/user/slice/userStore.ts
    - src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
    - src/features/profileDropDownMenu/index.ts
    - src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx
    - src/pages/SettingsPage/ui/SettingsPage.tsx

key-decisions:
  - "All four menu flags default false for beginner-friendly menu"
  - "Hide menu items only; routes /timer, /body-metrics, /load-table, /activity remain reachable"
  - "Persist + transfer follow aiFillEnabled coerce/boolean validation pattern"

patterns-established:
  - "Optional nav: store flag → Settings checkbox → conditional Separator+Button in ProfileDropDownMenu"

requirements-completed: [QUICK-TQU-01, QUICK-TQU-02, QUICK-TQU-03, QUICK-TQU-04]

coverage:
  - id: D1
    description: "Four menu flags default false with setters and persist merge coerce"
    requirement: QUICK-TQU-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
    human_judgment: false
  - id: D2
    description: "Settings card «Дополнительные разделы» with four checkboxes wired to store"
    requirement: QUICK-TQU-02
    verification:
      - kind: other
        ref: "rg MenuSectionsSettingsCard SettingsPage + MenuSectionsSettingsCard.tsx"
        status: pass
    human_judgment: true
    rationale: "Visual placement and Russian labels need human glance on Settings page"
  - id: D3
    description: "Profile menu hides Timer/Body metrics/Load table/Activity when flags off"
    requirement: QUICK-TQU-03
    verification:
      - kind: other
        ref: "rg menu flags in profileDropDownMenu.tsx; routes still present"
        status: pass
    human_judgment: true
    rationale: "Toggle each flag and confirm menu item appears/disappears"
  - id: D4
    description: "userProfile export/import includes all four menu flags"
    requirement: QUICK-TQU-04
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-08-11
status: complete
---

# Phase 260811-tqu: Optional Menu Features Summary

**Timer, body metrics, load table, and activity menu items are OFF by default and appear only after enabling checkboxes in Settings; routes stay reachable via deep link.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-11T18:28:20Z
- **Completed:** 2026-08-11T18:33:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added `timerMenuEnabled`, `bodyMetricsMenuEnabled`, `loadTableMenuEnabled`, `activityMenuEnabled` (default `false`) with setters and boolean merge coerce in `userStore`.
- Mirrored the four flags through `userProfile` export/import in `appSettingsSectionRegistry`.
- Shipped Settings card «Дополнительные разделы» and gated the four profile menu entries (Separator grouped with each item).

## Task Commits

Each task was committed atomically:

1. **Task 1: Persist four menu flags in userStore + transfer** - `b1a71c7` (feat)
2. **Task 2: Settings card «Дополнительные разделы»** - `3acf851` (feat)
3. **Task 3: Gate four menu items by flags** - `7494703` (feat)

**Plan metadata:** skipped (orchestrator handles docs commit per constraints)

## Files Created/Modified

- `src/entities/user/slice/userStore.ts` — four flags, setters, persist merge
- `src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts` — userProfile transfer fields
- `src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx` — settings UI
- `src/features/profileDropDownMenu/index.ts` — barrel export
- `src/pages/SettingsPage/ui/SettingsPage.tsx` — mount card after timer notifications
- `src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx` — conditional menu items

## Decisions Made

- Followed `aiFillEnabled` / multi-checkbox settings card patterns from the plan.
- Did not remove or comment routes — deep links remain intentional (T-TQU-03 accept).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Optional menu gating is ready for UAT: Settings toggles ↔ menu visibility; direct URLs still open pages.

## Self-Check: PASSED

- FOUND: `src/entities/user/slice/userStore.ts`
- FOUND: `src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx`
- FOUND: `src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx`
- FOUND: `src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts`
- FOUND: `src/pages/SettingsPage/ui/SettingsPage.tsx`
- FOUND commits: `b1a71c7`, `3acf851`, `7494703`
- Routes `/timer`, `/body-metrics`, `/load-table`, `/activity` still present in `routes.tsx`

---
*Phase: 260811-tqu-optional-menu-features*
*Completed: 2026-08-11*
