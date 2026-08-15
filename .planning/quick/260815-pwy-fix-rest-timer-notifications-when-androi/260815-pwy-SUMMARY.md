---
phase: 260815-pwy-fix-rest-timer-notifications-when-androi
plan: 01
subsystem: timer
tags: [capacitor, local-notifications, android, rest-timer, web-audio, settings]

requires:
  - phase: 260715-3fn-2
    provides: "persisted restTimerStore endAt + RestTimerExpiryWatcher setTimeout"
  - phase: 260422-pbk-capacitor-android-back-history
    provides: "Capacitor App plugin and native Android shell"
provides:
  - "Native LocalNotifications.schedule at endAt (id 710015, channel rest-timer-complete)"
  - "Cancel pending OS alarm on pause/clear/completeRestTimer"
  - "Resume reconcile: delivered OS banner without Web Audio; expired in-memory endAt via completeRestTimer"
  - "timerNotificationVolume 0–1 persist + Settings range 0–100 for Web Audio only"
affects: [timer, settings, android-manifest, app-settings-transfer]

actuals:
  tokens: 8045
  tasks: 3
  commits: 3

tech-stack:
  added:
    - "@capacitor/local-notifications ^8.3.0"
  patterns:
    - "JS setTimeout watcher kept for foreground/web; native schedule only on Capacitor.isNativePlatform()"
    - "Single constant notification id; cancel-before-schedule and cancel on pause/clear/complete"
    - "In-app volume is Web Audio gain; lock-screen loudness stays OS channel"

key-files:
  created:
    - src/features/timer/lib/restTimerLocalNotification.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - android/app/src/main/AndroidManifest.xml
    - android/capacitor.settings.gradle
    - android/app/capacitor.build.gradle
    - ios/App/CapApp-SPM/Package.swift
    - src/features/timer/lib/useRestTimerExpiryWatcher.ts
    - src/features/timer/lib/completeRestTimer.ts
    - src/features/timer/lib/notifications.ts
    - src/features/timer/ui/TimerNotificationsSettingsCard.tsx
    - src/entities/user/slice/userStore.ts
    - src/entities/user/index.ts
    - src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts

key-decisions:
  - "Lock-screen rest-complete uses LocalNotifications.schedule({ at }) without allowWhileIdle or USE_EXACT_ALARM"
  - "SCHEDULE_EXACT_ALARM only in the app manifest; POST_NOTIFICATIONS comes from the plugin merge"
  - "Foreground completeRestTimer cancels id 710015 before notify; persist merge still drops expired endAt without beep"
  - "timerNotificationVolume 0–1 default 1 scales Web Audio peak only (0.35 * volume, floor 0.0001)"

patterns-established:
  - "Native rest alarm lives beside the JS watcher, not inside restTimerStore persist merge"
  - "App.appStateChange resume: delivered id → acknowledge without Web Audio; else expired endAt → completeRestTimer"

requirements-completed: [QUICK-PWY-01, QUICK-PWY-02, QUICK-PWY-03]

coverage:
  - id: D1
    description: "Native Android schedules one local notification at endAt on channel rest-timer-complete (importance 4); web does not call schedule"
    requirement: QUICK-PWY-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg REST_TIMER_NOTIFICATION_ID|syncRestTimerNativeAlarm|createChannel|SCHEDULE_EXACT_ALARM"
        status: pass
    human_judgment: true
    rationale: "Lock-screen OS banner is device OS behavior and was not run on a physical Android 14+ device"
  - id: D2
    description: "Pause/clear/completeRestTimer cancel id 710015; resume strips delivered banner without Web Audio; persist merge expired-endAt drop unchanged"
    requirement: QUICK-PWY-02
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg cancelRestTimerNotification|acknowledgeRestTimerOsDelivery|reconcileRestTimerOnAppActive"
        status: pass
    human_judgment: true
    rationale: "Foreground no-double-banner and pause-before-endAt need a device check"
  - id: D3
    description: "Settings range 0–100 persists as timerNotificationVolume 0–1 and scales Web Audio only; transfer export/import included"
    requirement: QUICK-PWY-03
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg timerNotificationVolume|timer-notification-volume|0.35 * "
        status: pass
    human_judgment: true
    rationale: "In-app beep loudness vs lock-screen channel volume needs a human listen"

duration: 6min
completed: 2026-08-15
status: complete
---

# Phase 260815-pwy Plan 01: Rest Timer Lock-Screen Notifications Summary

**Native Android rest-complete uses `@capacitor/local-notifications` scheduled at `endAt` (id 710015, channel `rest-timer-complete`); in-app volume slider scales Web Audio only.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-15T15:49:10Z
- **Completed:** 2026-08-15T15:55:15Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- Installed `@capacitor/local-notifications` `^8.3.0`, ran `pnpm exec cap sync`, and declared `SCHEDULE_EXACT_ALARM` on the app manifest.
- Native start with notifications on schedules one OS alarm at `endAt`; pause/clear/foreground `completeRestTimer` cancel pending id `710015`; JS `setTimeout` watcher remains for web and foreground.
- Resume (`App.appStateChange` isActive) strips a delivered OS banner without Web Audio, or runs `completeRestTimer` for an expired in-memory `endAt`.
- Settings can request plugin notification permission and Android exact-alarm settings; `timerNotificationVolume` persists 0–1 and drives in-app beep gain.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end native rest-complete alarm at endAt** - `b2b003d` (feat)
2. **Task 2: Resume delivered-or-expired path and native permission prompts** - `cbadcde` (feat)
3. **Task 3: Persist timerNotificationVolume and Settings range for Web Audio** - `aecf877` (feat)
4. **Follow-up: keep native rest alarm across watcher effect cleanup** - `903a8d9` (fix)

**Plan metadata:** skipped (orchestrator handles docs commit per constraints)

## Files Created/Modified

- `src/features/timer/lib/restTimerLocalNotification.ts` — schedule/cancel/channel/sync + resume reconcile; `REST_TIMER_NOTIFICATION_ID = 710015`
- `src/features/timer/lib/useRestTimerExpiryWatcher.ts` — JS timeout + native sync + `appStateChange` resume
- `src/features/timer/lib/completeRestTimer.ts` — cancel native pending before notify; `acknowledgeRestTimerOsDelivery`
- `src/features/timer/lib/notifications.ts` — native `requestPermissions` on Start; Web Audio peak `0.35 * volume`
- `src/features/timer/ui/TimerNotificationsSettingsCard.tsx` — native permission + exact-alarm buttons + volume range
- `src/entities/user/slice/userStore.ts` — `timerNotificationVolume` 0–1 default 1, setter, merge clamp
- `src/entities/user/index.ts` — export `clampTimerNotificationVolume`
- `src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts` — userProfile export/import of volume
- `package.json` / `pnpm-lock.yaml` — `@capacitor/local-notifications` `^8.3.0`
- `android/app/src/main/AndroidManifest.xml` — `SCHEDULE_EXACT_ALARM`
- `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`, `ios/App/CapApp-SPM/Package.swift` — Capacitor plugin wiring

## Decisions Made

- Used official Ionic `@capacitor/local-notifications` `^8.3.0` (Capacitor 8). Did not add KeepAwake, foreground service, or `USE_EXACT_ALARM`.
- `schedule.at` has only the `at` key (no `allowWhileIdle`) so 15–600s rests are not delayed by the 9-minute Doze quota.
- Persist merge still nulls expired `endAt` without `notifyTimerComplete` so hydrate does not double-beep after OS delivery.
- In-app slider does not change native channel sound/loudness.

## Deviations from Plan

None - plan executed as written, with these wiring notes (not behavior changes):

**1. [Rule 3 - Blocking] Generated Capacitor files beyond the listed `capacitor.plugins.json`**
- **Found during:** Task 1
- **Issue:** `android/app/src/main/assets/capacitor.plugins.json` is gitignored (`android/.gitignore`). `cap sync` also updates `capacitor.build.gradle` and iOS `Package.swift`.
- **Fix:** Committed generated gradle/SPM wiring; left gitignored `capacitor.plugins.json` untracked (local `cap sync` still writes it).
- **Files modified:** `android/app/capacitor.build.gradle`, `ios/App/CapApp-SPM/Package.swift`
- **Verification:** plugin listed in gradle + Package.swift; `tsc -b` passes
- **Committed in:** `b2b003d`

**2. [Rule 2 - Missing Critical] POST_NOTIFICATIONS not copied into the app manifest**
- **Found during:** Task 1 (research A1)
- **Issue:** App manifest still lacked `POST_NOTIFICATIONS` after sync.
- **Fix:** Plugin library already declares `POST_NOTIFICATIONS` (and `SCHEDULE_EXACT_ALARM`); merged APK will include it. App manifest only adds the plan-required `SCHEDULE_EXACT_ALARM`.
- **Files modified:** none extra
- **Verification:** plugin `AndroidManifest.xml` contains `POST_NOTIFICATIONS`
- **Committed in:** `b2b003d`

---

**Total deviations:** 2 auto-fixed (1 blocking wiring, 1 merge-permission note)
**Impact on plan:** No scope creep. Native schedule/cancel/volume behavior matches the plan.

## Issues Encountered

None blocking. Concurrent q1b commits landed on `master` between task commits; this plan's files did not conflict.

## Human-check (lock-screen UAT)

**Status:** pending / not-run — no physical Android device in this executor environment.

Expected device checks (Android 14+):

1. Enable notifications + exact alarms; start rest 15–30s; lock screen before `endAt` → OS banner/sound of channel `rest-timer-complete`.
2. Pause before `endAt` → no OS banner.
3. Foreground wait until end → one in-app beep, no second OS banner.
4. Volume slider changes only in-app beep; lock-screen loudness unchanged.
5. Web/PWA still beeps via `setTimeout`; no native schedule.

## User Setup Required

None - no external service configuration required. Device UAT needs a physical Android build (`pnpm run build:cap` then install) with notification and exact-alarm grants.

## Next Phase Readiness

- Code path is in place for lock-screen rest-complete on native Android/iOS.
- Remaining gate: human lock-screen UAT on Android 14+ (recorded pending above).

---
*Phase: 260815-pwy-fix-rest-timer-notifications-when-androi*
*Completed: 2026-08-15*

## Self-Check: PASSED
