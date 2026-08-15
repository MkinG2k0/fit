# Quick Task: Fix rest timer notifications when Android is locked + notification volume

**Researched:** 2026-08-15
**Domain:** Capacitor 8 Android local notifications + Web Audio volume
**Confidence:** HIGH (codebase + official Capacitor v8 docs); MEDIUM (Play exact-alarm policy interpretation)

## User Constraints

`CONTEXT.md` для этого quick-task нет — locked / discretion / deferred секций нет. Scope задан оркестратором: lock-screen rest-complete на Android + громкость в Settings. [VERIFIED: research_context]

## Project Constraints (from .cursor/rules/)

- **pnpm only:** `pnpm add`, `pnpm exec cap sync` — не npm/npx. [VERIFIED: `.cursor/rules/pnpm-package-manager.mdc`]
- **Styling tokens first:** Tailwind semantic tokens (`accent-primary`, `text-muted-foreground`, `border-border`); no raw colors. [VERIFIED: `.cursor/rules/styling-tokens-priority.mdc`]
- **No CSS Modules;** Tailwind `className` inline; no `const styles = '...'`. [VERIFIED: AGENTS.md conventions]
- **FSD:** timer logic in `src/features/timer`; user prefs in `src/entities/user`; settings cards stay in feature UI.

## Summary

Lock-screen miss is expected with the current JS-only path: `window.setTimeout` in `useRestTimerExpiryWatcher` plus Web Audio `AudioContext` cannot run while Capacitor WebView is paused. Persist merge also drops expired `endAt` without notifying.

**Primary recommendation:** schedule one `@capacitor/local-notifications` alarm at `endAt` on native only; cancel on pause/clear; keep the JS watcher for foreground + web. Persist `timerNotificationVolume` (0–1) for Web Audio gain. Do **not** use KeepAwake, a foreground service, or `USE_EXACT_ALARM`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary | Rationale |
|------------|--------------|-----------|-----------|
| Rest deadline (`endAt`) | Browser / Client | — | Zustand `restTimerStore` already owns it |
| Foreground beep/vibrate | Browser / Client | — | Web Audio + `navigator.vibrate` while WebView is running |
| Lock-screen / paused WebView alert | OS (Android AlarmManager / iOS UNUserNotificationCenter) via Capacitor plugin | Browser on resume | JS is frozen; OS must fire |
| In-app volume slider | Browser / Client | — | Only Web Audio gain is app-controllable |
| System notification loudness | OS | — | Channel volume is user/OS-controlled |
| Pref persist + transfer | Browser storage | — | `userStore` + settings export registry |

## Standard Stack

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@capacitor/local-notifications` | **8.3.0** (latest; match `@capacitor/core` `^8.3.1`) | `schedule({ at })` / `cancel` / channels / permissions | Official Capacitor 8 plugin [CITED: capacitorjs.com/docs/apis/local-notifications] [VERIFIED: npm registry `8.3.0`, created 2021-01-13] |
| `@capacitor/app` | already `^8.1.0` | `appStateChange` / `resume` | Already used in `AndroidBackNavigation.tsx` [VERIFIED: package.json:22] |

**Do not add:** `@capacitor-community/keep-awake`, foreground-service plugins, `@radix-ui/react-slider` / shadcn `slider.tsx`.

**Installation:**

```bash
pnpm add @capacitor/local-notifications@^8.3.0
pnpm exec cap sync
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@capacitor/local-notifications` | npm | created 2021-01-13; latest 8.3.0 published 2026-08-14 | 452104/wk | github.com/ionic-team/capacitor-local-notifications | **SUS** (seam: `too-new` on latest tag only) | Approved — official Ionic plugin, not slopsquat. Planner: 1-line checkpoint that version is `^8.3.0` matching Capacitor 8. |

**Packages removed due to [SLOP]:** none
**Packages flagged [SUS]:** `@capacitor/local-notifications` — false-positive `too-new`; identity is official.

## Recommended approach (prescriptive)

**Pick scheduled Local Notifications. Reject KeepAwake (screen stays on; does not help after the user already locked). Reject a foreground service (Play policy + sticky notification for a 15–600s rest).**

### Native schedule (Android-first, iOS-safe)

1. Constant notification id, 32-bit int, e.g. `REST_TIMER_NOTIFICATION_ID = 710015`.
2. On **native only** (`Capacitor.isNativePlatform()`), when `endAt` is set and `timerCompleteNotificationsEnabled` is true:
   - `LocalNotifications.schedule({ notifications: [{ id, title, body, extra: { endAt }, schedule: { at: new Date(endAt) }, channelId: 'rest-timer-complete', autoCancel: true }] })`
3. **Do not set `allowWhileIdle: true`.** Official docs: those alarms fire at most once per 9 minutes per app [CITED: capacitorjs.com/docs/apis/local-notifications]. Rest is 15–600s (`MIN_REST_DURATION_SEC` / `MAX_REST_DURATION_SEC` [VERIFIED: restTimerStore.ts:5-6 `export const MIN_REST_DURATION_SEC = 15;` / `export const MAX_REST_DURATION_SEC = 600;`]). Screen lock ≠ Doze; exact `at` is enough for the reported bug.
4. On `pause` / `clear` / `endAt === null`: `LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] })`.
5. Reschedule on `start` / `resume` (new `endAt`). Implement via a hook next to the watcher (subscribe to `endAt`), not inside persist `merge`.

### Android 12+ / 13 / 14 pitfalls

| Topic | What to do |
|-------|------------|
| `POST_NOTIFICATIONS` (API 33+) | `LocalNotifications.checkPermissions()` + `requestPermissions()` on native Start / Settings. App `targetSdkVersion = 36` [VERIFIED: android/variables.gradle:4 `targetSdkVersion = 36`]. Web `Notification.requestPermission()` is **not** sufficient in Capacitor. |
| Exact alarms | Add **only** `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />` to app `AndroidManifest.xml` [CITED: capacitorjs.com/docs/apis/local-notifications]. Current manifest has only `INTERNET` [VERIFIED: AndroidManifest.xml:65 `<uses-permission android:name="android.permission.INTERNET" />`]. |
| `USE_EXACT_ALARM` | **Do not declare.** Play restricts it to alarm-clock/calendar core apps [CITED: developer.android.com/about/versions/14/changes/schedule-exact-alarms]. Rest timer is a secondary gym feature. |
| Android 14 default-deny | `SCHEDULE_EXACT_ALARM` is denied by default. Call `checkExactNotificationSetting()`; if not granted, Settings card button → `changeExactNotificationSetting()`. Recheck on `appStateChange` because denying exact alarms **restarts the app and deletes exact schedules** [CITED: capacitorjs.com/docs/apis/local-notifications]. |
| Channel | `createChannel` once (Android only): `id: 'rest-timer-complete'`, `importance: 4` (HIGH / heads-up), `vibration: true`, name «Таймер отдыха». If `channelId` is set but the channel does not exist, **the notification will not fire** [CITED: capacitorjs.com/docs/apis/local-notifications]. Channel loudness is OS-controlled after creation — do not recreate the channel to “set volume”. |
| Doze | Out of scope for typical gym rest. Do not compensate with KeepAwake. |

### Double-fire vs JS watcher

Foreground: JS `setTimeout` / `react-timer-hook` still fires `completeRestTimer`. That function already dedupes per `endAt` [VERIFIED: completeRestTimer.ts:8-12 `if (claimedEndAt === endAt) { return false; }`]. **Always `cancel` the native pending id at the start of `completeRestTimer`** so the OS banner does not also appear.

Background/locked: WebView paused → JS timeout frozen → OS notification is the only fire. Persist merge then drops expired `endAt` **without** `notifyTimerComplete` [VERIFIED: restTimerStore.ts:98-100 `if (endAt != null && endAt <= Date.now()) { endAt = null; }`]. **Leave that drop as-is** so hydrate does not double-beep; the OS notification already delivered.

### App resume

Reuse `@capacitor/app` like `AndroidBackNavigation.tsx`. On `appStateChange` with `isActive === true` (or `resume`):

1. `getDeliveredNotifications()`; if our id is present → `removeDeliveredNotifications` + `clear()` store + set `claimedEndAt` — **skip** Web Audio (OS already sounded).
2. Else if in-memory `endAt != null && endAt <= Date.now()` → `completeRestTimer(endAt)` (covers WebView-paused-but-not-killed without persist re-merge).

### Volume in Settings

| Surface | Controllable in-app? | Action |
|---------|----------------------|--------|
| Web Audio beeps | Yes | Persist `timerNotificationVolume: number` 0–1 in `userStore` (default `1`). Multiply current peak `0.35` [VERIFIED: notifications.ts:31 `gainNode.gain.exponentialRampToValueAtTime(0.35, startAt + 0.02);`]. UI: `type="range"` 0–100, `accent-primary`, same Card pattern as `RestBetweenSetsSettingsCard` [VERIFIED: RestBetweenSetsSettingsCard.tsx:132-140]. **Do not add shadcn Slider** (no `slider.tsx` in repo). |
| Native LocalNotifications / channel | No | Hint: «На заблокированном экране громкость системных уведомлений». Optional `sound` on channel = default OS sound, not app gain. |

Wire `timerNotificationVolume` through `userStore` merge + `appSettingsSectionRegistry` the same way as `timerCompleteNotificationsEnabled` [VERIFIED: userStore.ts:63-64, 327-330; appSettingsSectionRegistry.ts:100, 304-305].

### Web / PWA

Keep `useRestTimerExpiryWatcher` `setTimeout`. Do **not** schedule native notifications on web. Service worker `SHOW_NOTIFICATION` only works while JS is alive [VERIFIED: sw.js:67-81] — no Push, so no reliable future fire. Native-only schedule.

### iOS (don’t break, don’t over-scope)

Same `schedule`/`cancel` APIs work. Skip `createChannel` / exact-alarm APIs unless `Capacitor.getPlatform() === 'android'`. `requestPermissions()` still required. Optional later: `presentationOptions: ['sound', 'banner', 'list']` in `capacitor.config.ts`. No KeepAwake / Critical Alerts.

## Architecture Patterns

```
start/resume (endAt set)
  ├─ native: LocalNotifications.schedule(at: endAt)
  └─ all: setTimeout(endAt) in RestTimerExpiryWatcher (frozen if WebView paused)

pause/clear (endAt null)
  └─ native: LocalNotifications.cancel(id)

expiry while foreground
  └─ completeRestTimer → cancel native → Web Audio × volume + vibrate + (web) Notification

expiry while locked
  └─ OS notification (channel sound/vibrate)
      persist merge may null endAt (no JS notify) ✓

resume
  └─ delivered? strip + clear : expired endAt? completeRestTimer
```

Hook lives in `src/features/timer` (extend `useRestTimerExpiryWatcher` or sibling). Watcher already mounted in `AppLayout` [VERIFIED: AppLayout.tsx:51 `<RestTimerExpiryWatcher />`].

## Don't Hand-Roll

| Problem | Don't build | Use |
|---------|-------------|-----|
| Fire at `endAt` after WebView pause | KeepAwake / custom AlarmManager plugin / foreground service | `@capacitor/local-notifications` `schedule.at` |
| Cancel on pause | Ad-hoc native code | `LocalNotifications.cancel` |
| POST_NOTIFICATIONS / exact-alarm prompts | Raw intents | `requestPermissions` / `changeExactNotificationSetting` |
| Volume UI | New shadcn Slider package | Existing `<input type="range">` |

## Common Pitfalls

1. **`allowWhileIdle: true` on every rest** — 9-minute quota delays consecutive 2-min rests. Omit it.
2. **`USE_EXACT_ALARM`** — Play rejection risk. Use `SCHEDULE_EXACT_ALARM` + settings deep-link.
3. **Channel missing** — `channelId` set but `createChannel` never called → silent no-fire.
4. **Calling `notifyTimerComplete` from persist `merge`** — merge is sync; would double-fire with OS. Leave expired-`endAt` drop.
5. **Foreground double banner** — forget to `cancel` in `completeRestTimer`.
6. **Web `Notification.requestPermission` only** — Android 13+ still blocked without plugin `requestPermissions`.
7. **Assuming in-app volume changes lock-screen loudness** — it cannot.
8. **Exact alarm revoked** — app restart deletes pending exact alarms; reschedule on next `endAt` after `checkExactNotificationSetting`.

## Code Examples

### Schedule / cancel (native)

```ts
// Source: https://capacitorjs.com/docs/apis/local-notifications
import { LocalNotifications } from "@capacitor/local-notifications";

await LocalNotifications.schedule({
  notifications: [
    {
      id: 710015,
      title: "Таймер завершен!",
      body: "Время для следующего подхода",
      extra: { endAt },
      channelId: "rest-timer-complete",
      autoCancel: true,
      schedule: { at: new Date(endAt) },
    },
  ],
});

await LocalNotifications.cancel({ notifications: [{ id: 710015 }] });
```

### Resume (existing App plugin)

```ts
// Source: https://capacitorjs.com/docs/apis/app
import { App } from "@capacitor/app";

App.addListener("appStateChange", ({ isActive }) => {
  if (isActive) {
    /* delivered-or-expired path above */
  }
});
```

### Volume → existing beep envelope

Scale the existing peak; keep exponential ramps (0 is invalid for `exponentialRampToValueAtTime`):

```ts
const peak = Math.max(0.0001, 0.35 * volume); // volume 0–1 from userStore
```

## Validation Architecture

| Property | Value |
|----------|-------|
| Framework | none — no `*.test.*` / vitest / jest in repo [VERIFIED: package.json scripts; glob 0 test files] |
| Quick run | `pnpm run lint` |
| Full suite | `pnpm run build` + `pnpm exec cap sync` |

Do **not** add Vitest in this quick task. Lock-screen delivery is an OS behavior.

| Req | Behavior | Test type | File |
|-----|----------|-----------|------|
| Lock-screen fire | OS notification at `endAt` with screen off | **manual** on Android 14 device | — |
| Cancel on pause | No notification if paused before `endAt` | manual | — |
| Foreground no double | One beep, no extra OS banner | manual | — |
| Volume slider | In-app beep loudness changes; lock-screen unchanged | manual | — |
| Web | Existing timeout still works; no plugin calls | manual / PWA | — |

**Wave 0 gaps:** none that block planning. Primary gate: physical Android lock-screen UAT.

## Security Domain

| ASVS | Applies | Control |
|------|---------|---------|
| V2 Authentication | no | — |
| V3 Session | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Clamp volume 0–1; `endAt` finite number already in store merge |
| V6 Cryptography | no | — |

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Notification body injection | Tampering | Fixed Russian copy; `extra.endAt` is a number |
| Exact-alarm permission abuse | Elevation | `SCHEDULE_EXACT_ALARM` (user-revocable), not `USE_EXACT_ALARM` |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node | install / build | ✓ | v22.15.0 | — |
| pnpm | install | ✓ | 9.6.0 | — |
| Capacitor CLI | `cap sync` | ✓ | 8.3.1 | — |
| Locked Android device | UAT | unknown | — | Human device test |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Plugin `cap sync` merges `POST_NOTIFICATIONS` / `VIBRATE`; app manifest still needs `SCHEDULE_EXACT_ALARM` by hand | Android pitfalls | Missing POST_NOTIFICATIONS → add explicitly |
| A2 | Notification id `710015` is unused | Approach | Collision with another local notif |
| A3 | Default volume `1` (= current 0.35 peak) is acceptable | Volume | User may want quieter default |

## Open Questions

None blocking. Exact-alarm Settings copy can stay short («Разрешить точные будильники») until UAT.

## Sources

### Primary
- https://capacitorjs.com/docs/apis/local-notifications (v8) — schedule, cancel, channels, exact alarms, Doze 9-min quota
- https://capacitorjs.com/docs/apis/app — `appStateChange` / `resume`
- Context7 `/ionic-team/capacitor-plugins` + `/websites/capacitorjs`
- In-repo timer/settings files listed in research_context

### Secondary
- https://developer.android.com/about/versions/14/changes/schedule-exact-alarms — `SCHEDULE_EXACT_ALARM` vs `USE_EXACT_ALARM`

## Metadata

**Confidence:** Standard stack HIGH (npm 8.3.0 + official docs). Architecture HIGH (codebase). Pitfalls HIGH (Capacitor Android notes). Play `USE_EXACT_ALARM` policy MEDIUM (cited Android 14 doc).
**Valid until:** 30 days (Capacitor 8 plugin surface is stable)
