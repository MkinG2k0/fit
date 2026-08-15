---
phase: 260815-pwy-fix-rest-timer-notifications-when-androi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - android/app/src/main/AndroidManifest.xml
  - android/capacitor.settings.gradle
  - android/app/src/main/assets/capacitor.plugins.json
  - src/features/timer/lib/restTimerLocalNotification.ts
  - src/features/timer/lib/useRestTimerExpiryWatcher.ts
  - src/features/timer/lib/completeRestTimer.ts
  - src/features/timer/lib/notifications.ts
  - src/features/timer/ui/TimerNotificationsSettingsCard.tsx
  - src/entities/user/slice/userStore.ts
  - src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
autonomous: true
requirements:
  - QUICK-PWY-01
  - QUICK-PWY-02
  - QUICK-PWY-03
estimate:
  tokens: 30000
  raw_tokens: 30000
  tasks: 3
  confidence: low
must_haves:
  truths:
    - "На native Android старт таймера отдыха планирует одно локальное уведомление на endAt; на заблокированном экране срабатывает OS-баннер канала rest-timer-complete."
    - "Пауза, сброс и completeRestTimer снимают pending id 710015, поэтому в foreground нет второго OS-баннера."
    - "После возврата в приложение доставленное native-уведомление снимается без повторного Web Audio; просроченный in-memory endAt вызывает completeRestTimer."
    - "В Настройках ползунок громкости 0–100 меняет только in-app Web Audio; persist+transfer хранят timerNotificationVolume 0–1."
    - "На web/PWA по-прежнему работает setTimeout watcher; LocalNotifications.schedule не вызывается вне native."
  artifacts:
    - path: src/features/timer/lib/restTimerLocalNotification.ts
      provides: "schedule/cancel/channel/sync + resume delivered-or-expired helpers; REST_TIMER_NOTIFICATION_ID = 710015"
    - path: src/features/timer/lib/useRestTimerExpiryWatcher.ts
      provides: "JS timeout + native sync on endAt + App.appStateChange resume"
    - path: src/features/timer/lib/completeRestTimer.ts
      provides: "cancel native pending before notify; acknowledgeRestTimerOsDelivery without Web Audio"
    - path: src/features/timer/ui/TimerNotificationsSettingsCard.tsx
      provides: "native permission + exact-alarm button + volume range input"
    - path: src/entities/user/slice/userStore.ts
      provides: "timerNotificationVolume 0–1 default 1, setter, merge clamp"
    - path: android/app/src/main/AndroidManifest.xml
      provides: "SCHEDULE_EXACT_ALARM uses-permission"
  key_links:
    - from: "useRestTimerStore.endAt"
      to: "LocalNotifications.schedule at endAt"
      via: "useRestTimerExpiryWatcher → syncRestTimerNativeAlarm"
    - from: "completeRestTimer"
      to: "LocalNotifications.cancel id 710015"
      via: "cancelRestTimerNotification before notifyTimerComplete"
    - from: "App.appStateChange isActive"
      to: "restTimerStore.clear without beep"
      via: "getDeliveredNotifications id 710015 → acknowledgeRestTimerOsDelivery"
    - from: "userStore.timerNotificationVolume"
      to: "playNotificationSound gain peak"
      via: "Math.max(0.0001, 0.35 * volume)"
---

<objective>
Починить уведомление о конце отдыха на заблокированном Android и добавить громкость in-app звука в Настройки.

Purpose: JS setTimeout и Web Audio замирают вместе с WebView; OS должна стрелять в endAt. Громкость ползунка управляет только Web Audio (QUICK-PWY-01, QUICK-PWY-02, QUICK-PWY-03).
Output: @capacitor/local-notifications ^8.3.0, native schedule/cancel, resume-reconcile, timerNotificationVolume в userStore и Settings.
</objective>

<execution_context>
@C:/Users/mk/.cursor/gsd-core/workflows/execute-plan.md
@C:/Users/mk/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260815-pwy-fix-rest-timer-notifications-when-androi/260815-pwy-RESEARCH.md
@src/features/timer/lib/useRestTimerExpiryWatcher.ts
@src/features/timer/lib/completeRestTimer.ts
@src/features/timer/lib/notifications.ts
@src/features/timer/slice/restTimerStore.ts
@src/features/timer/ui/TimerNotificationsSettingsCard.tsx
@src/features/exercise/ui/RestBetweenSetsSettingsCard.tsx
@src/app/providers/AndroidBackNavigation.tsx
@src/entities/user/slice/userStore.ts
@src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
@src/app/layout/AppLayout.tsx
@android/app/src/main/AndroidManifest.xml
@package.json
</context>

<tasks>

<task type="tracer">
  <name>End-to-end native rest-complete alarm at endAt</name>
  <files>package.json, pnpm-lock.yaml, android/app/src/main/AndroidManifest.xml, src/features/timer/lib/restTimerLocalNotification.ts, src/features/timer/lib/useRestTimerExpiryWatcher.ts, src/features/timer/lib/completeRestTimer.ts</files>
  <read_first>src/features/timer/lib/useRestTimerExpiryWatcher.ts, src/features/timer/lib/completeRestTimer.ts, src/features/timer/slice/restTimerStore.ts, android/app/src/main/AndroidManifest.xml, package.json</read_first>
  <action>
Install the official Ionic plugin with pnpm add @capacitor/local-notifications@^8.3.0 (pin the caret range that matches Capacitor 8; do not use npm). Then pnpm exec cap sync so Android/iOS register the plugin. Commit generated Capacitor plugin wiring (capacitor.settings.gradle, capacitor.plugins.json, iOS Podfile if changed).

Add only android.permission.SCHEDULE_EXACT_ALARM to android/app/src/main/AndroidManifest.xml next to the existing INTERNET permission. Do not declare the calendar/alarm-clock special exact-alarm permission. After sync, if POST_NOTIFICATIONS is still absent from the merged app manifest, add it there (research A1).

Create src/features/timer/lib/restTimerLocalNotification.ts:
- REST_TIMER_NOTIFICATION_ID = 710015 (32-bit int).
- CHANNEL_ID = rest-timer-complete.
- isNativeTimerPlatform(): Capacitor.isNativePlatform().
- ensureRestTimerCompleteChannel(): call LocalNotifications.createChannel only when Capacitor.getPlatform() === android, once per JS session (module flag). Channel: id rest-timer-complete, name «Таймер отдыха», importance 4, vibration true. Never recreate the channel to change loudness.
- cancelRestTimerNotification(): if native, LocalNotifications.cancel({ notifications: [{ id: 710015 }] }); swallow errors with console.error.
- scheduleRestTimerNotification(endAt: number): no-op unless native AND useUserStore.getState().timerCompleteNotificationsEnabled is true AND endAt is a finite number greater than Date.now(). Then ensure channel (android), then LocalNotifications.schedule one notification: id 710015, title «Таймер завершен!», body «Время для следующего подхода», extra: { endAt }, channelId rest-timer-complete, autoCancel true, schedule object with exactly one key at: new Date(endAt). Do not add extra schedule flags (Doze quota would delay 15–600s rests).
- syncRestTimerNativeAlarm(endAt: number | null): if not native or endAt is null or notifications disabled or endAt is not in the future, cancel; else schedule.

Wire useRestTimerExpiryWatcher: keep the existing window.setTimeout → completeRestTimer path for all platforms. Also subscribe to timerCompleteNotificationsEnabled. On each endAt/enabled change call void syncRestTimerNativeAlarm(endAt). Effect cleanup must cancel the native pending id (pause/clear sets endAt to null). Do not put schedule/cancel inside restTimerStore persist merge.

In completeRestTimer, at the very start (before the claimedEndAt short-circuit), void cancelRestTimerNotification() so a foreground JS fire does not also show the OS banner (QUICK-PWY-02). Then keep claimedEndAt dedupe, notifyTimerComplete, clear().

Do not change restTimerStore persist merge: expired endAt still becomes null without notifyTimerComplete (OS already delivered while locked). Do not add wake-lock or sticky-service plugins. Do not call schedule on web.
  </action>
  <verify>
    <automated>rg -n "REST_TIMER_NOTIFICATION_ID = 710015|syncRestTimerNativeAlarm|cancelRestTimerNotification|createChannel|SCHEDULE_EXACT_ALARM" src/features/timer android/app/src/main/AndroidManifest.xml; rg -n "@capacitor/local-notifications" package.json; pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>
    package.json depends on @capacitor/local-notifications ^8.3.0. Native start with notifications on schedules id 710015 at endAt. Pause/clear/completeRestTimer cancel that id. JS timeout still exists. App manifest has SCHEDULE_EXACT_ALARM. tsc -b passes.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Resume delivered-or-expired path and native permission prompts</name>
  <files>src/features/timer/lib/restTimerLocalNotification.ts, src/features/timer/lib/useRestTimerExpiryWatcher.ts, src/features/timer/lib/completeRestTimer.ts, src/features/timer/lib/notifications.ts, src/features/timer/ui/TimerNotificationsSettingsCard.tsx</files>
  <read_first>src/app/providers/AndroidBackNavigation.tsx, src/features/timer/lib/notifications.ts, src/features/timer/ui/TimerNotificationsSettingsCard.tsx, src/features/timer/lib/useTimer.ts</read_first>
  <action>
Export acknowledgeRestTimerOsDelivery(endAt: number | null) from completeRestTimer.ts: if endAt is a finite number, set claimedEndAt to it; then useRestTimerStore.getState().clear(). Do not call notifyTimerComplete.

Add reconcileRestTimerOnAppActive() in restTimerLocalNotification.ts (native only):
1. LocalNotifications.getDeliveredNotifications(); if any notification has id 710015, LocalNotifications.removeDeliveredNotifications for those entries, then acknowledgeRestTimerOsDelivery(useRestTimerStore.getState().endAt) and return (OS already sounded).
2. Else read in-memory endAt; if it is a finite number and endAt &lt;= Date.now(), call completeRestTimer(endAt) (WebView paused but not killed, persist merge did not run).
3. Else if endAt is still in the future, void syncRestTimerNativeAlarm(endAt) (exact-alarm grant after settings can restart the app and wipe pending exact schedules).

In useRestTimerExpiryWatcher, on native only, register App.addListener("appStateChange") like AndroidBackNavigation.tsx (PluginListenerHandle, remove on unmount). When isActive === true, void reconcileRestTimerOnAppActive().

Extend ensureNotificationPermission: if notifications are enabled and Capacitor.isNativePlatform(), also void LocalNotifications.requestPermissions() (Web Notification.requestPermission is not enough on Android 13+ / targetSdk 36). Keep the existing web Notification path for non-native.

On TimerNotificationsSettingsCard when native and the checkbox is on:
- Show plugin permission status via checkPermissions().display; button «Разрешить уведомления» calls requestPermissions() (not only window.Notification).
- Android only: checkExactNotificationSetting(); if not granted, button «Разрешить точные будильники» calls changeExactNotificationSetting(). Recheck both statuses on appStateChange isActive (denying exact alarms restarts the app).
- Skip createChannel / exact-alarm APIs unless platform is android. iOS still uses requestPermissions + schedule/cancel from task 1.

try/catch around all plugin calls; console.error on failure. Do not edit restTimerStore merge.
  </action>
  <verify>
    <automated>rg -n "acknowledgeRestTimerOsDelivery|reconcileRestTimerOnAppActive|appStateChange|checkExactNotificationSetting|changeExactNotificationSetting|requestPermissions" src/features/timer; pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>
    Resume: delivered id 710015 is stripped without Web Audio; expired in-memory endAt goes through completeRestTimer. Start/Settings request native notification permission. Android Settings can open exact-alarm settings and resync the alarm on return.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Persist timerNotificationVolume and Settings range for Web Audio</name>
  <files>src/entities/user/slice/userStore.ts, src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts, src/features/timer/lib/notifications.ts, src/features/timer/ui/TimerNotificationsSettingsCard.tsx</files>
  <read_first>src/entities/user/slice/userStore.ts, src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts, src/features/timer/lib/notifications.ts, src/features/exercise/ui/RestBetweenSetsSettingsCard.tsx</read_first>
  <action>
Add timerNotificationVolume: number to UserState, default 1. Add clampTimerNotificationVolume: if not finite return 1, else Math.min(1, Math.max(0, value)) — no extra rounding beyond 0–1. Add setTimerNotificationVolume that stores the clamped value. In persist.merge, if p.timerNotificationVolume is a finite number, clamp it; else keep current (old blobs → 1).

Mirror the field in appSettingsSectionRegistry userProfile exactly like timerCompleteNotificationsEnabled / restBetweenSetsSec: optional number in isUserProfileExport (present → finite number), exportSnapshot state.timerNotificationVolume ?? 1, import merge and create-new branches payload ?? prev/1 then clamp. Do not touch accessToken.

playNotificationSound: read timerNotificationVolume from userStore (default 1). Peak gain = Math.max(0.0001, 0.35 * volume) so exponentialRampToValueAtTime never gets 0. Volume 0 is effectively silent in-app. vibrateDevice and native/OS channel loudness stay independent of this pref (QUICK-PWY-03).

On TimerNotificationsSettingsCard, when the notification checkbox is on, add a block matching RestBetweenSetsSettingsCard duration row: Label «Громкость уведомления: {percent}%», input type=range id timer-notification-volume, min 0, max 100, step 1, value Math.round(volume * 100), onChange setTimerNotificationVolume(Number(event.target.value) / 100), className w-full accent-primary. Hint in text-xs text-muted-foreground: «На заблокированном экране громкость системных уведомлений». Tokens only (border-border, text-muted-foreground, accent-primary). Do not add a new slider primitive package.

Do not change native schedule payload sound/channel to chase in-app volume.
  </action>
  <verify>
    <automated>rg -n "timerNotificationVolume|setTimerNotificationVolume|timer-notification-volume|0.35 \* " src/entities/user/slice/userStore.ts src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts src/features/timer/lib/notifications.ts src/features/timer/ui/TimerNotificationsSettingsCard.tsx; pnpm exec tsc -b --pretty false</automated>
    <human-check>
      На физическом Android 14+: включить уведомления и точные будильники; старт отдыха 15–30 с; заблокировать экран до endAt — OS-баннер/звук канала. Пауза до endAt — баннера нет. Foreground дождаться конца — один in-app beep, без второго OS-баннера. Ползунок громкости меняет только in-app beep; lock-screen громкость не меняется ползунком. На web таймер по-прежнему пикает через setTimeout.
    </human-check>
  </verify>
  <done>
    timerNotificationVolume persists 0–1 default 1, is exported/imported with the profile, and scales Web Audio peak. Settings shows a type=range control and the lock-screen hint. tsc -b passes.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| WebView JS → Android AlarmManager / iOS UNUserNotificationCenter | Untrusted WebView schedules a future OS notification |
| Settings UI → userStore | Local volume and notification toggles persist on device |
| npm registry → Android/iOS binary | New Capacitor plugin enters the native app |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-PWY-01 | Elevation of Privilege | AndroidManifest exact-alarm permission | medium | mitigate | Declare only SCHEDULE_EXACT_ALARM (user-revocable). Gate schedule behind timerCompleteNotificationsEnabled. Settings deep-link via changeExactNotificationSetting. |
| T-PWY-02 | Tampering | Notification title/body/extra | low | mitigate | Fixed Russian copy; extra.endAt is a number from the store, not user-authored HTML. |
| T-PWY-03 | Tampering | timerNotificationVolume persist/import | low | mitigate | clampTimerNotificationVolume to 0–1; reject non-finite values in merge and isUserProfileExport. |
| T-PWY-04 | Denial of Service | Repeated native schedule | low | mitigate | Single constant id 710015; cancel-before-schedule / cancel on pause/clear/complete. |
| T-PWY-SC | Tampering | pnpm add @capacitor/local-notifications | high | mitigate | Install only the official package at ^8.3.0 (research: too-new seam is a false positive on the latest Ionic tag). Verify package.json name+range before cap sync. |
</threat_model>

<verification>
- package.json lists "@capacitor/local-notifications": "^8.3.0"; pnpm exec tsc -b passes; pnpm exec cap sync already run.
- rg shows syncRestTimerNativeAlarm wired from useRestTimerExpiryWatcher; completeRestTimer calls cancelRestTimerNotification; schedule at uses only the at key.
- App manifest contains SCHEDULE_EXACT_ALARM.
- timerNotificationVolume exists in userStore merge and appSettingsSectionRegistry export/import.
- Lock-screen delivery is OS behavior: record the human-check result in SUMMARY (pass/fail + device Android version).
</verification>

<success_criteria>
- QUICK-PWY-01: locked Android still gets rest-complete via LocalNotifications.schedule at endAt (channel rest-timer-complete, importance 4).
- QUICK-PWY-02: pause/clear/foreground complete cancel id 710015; persist merge expired-endAt drop unchanged.
- QUICK-PWY-03: Settings range 0–100 persists as 0–1 and scales Web Audio only.
- Web path unchanged: no native schedule off native.
- iOS uses the same schedule/cancel/requestPermissions; no android-only channel/exact-alarm calls on iOS.
</success_criteria>

<output>
Create `.planning/quick/260815-pwy-fix-rest-timer-notifications-when-androi/260815-pwy-SUMMARY.md` when done
</output>
