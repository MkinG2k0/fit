---
phase: 260811-tqu-optional-menu-features
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/entities/user/slice/userStore.ts
  - src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
  - src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx
  - src/features/profileDropDownMenu/index.ts
  - src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx
  - src/pages/SettingsPage/ui/SettingsPage.tsx
autonomous: true
requirements:
  - QUICK-TQU-01
  - QUICK-TQU-02
  - QUICK-TQU-03
  - QUICK-TQU-04
must_haves:
  truths:
    - "В Настройках есть карточка «Дополнительные разделы» с четырьмя чекбоксами; все по умолчанию выключены."
    - "В меню профиля пункты Таймер, Параметры тела, Таблица нагрузок и Активность видны только при включённом соответствующем флаге."
    - "Маршруты /timer, /body-metrics, /load-table, /activity не удаляются — deep link продолжает открывать страницы."
    - "Четыре флага сохраняются в userStore persist и участвуют в экспорте/импорте секции userProfile."
  artifacts:
    - path: src/entities/user/slice/userStore.ts
      provides: "timerMenuEnabled, bodyMetricsMenuEnabled, loadTableMenuEnabled, activityMenuEnabled (default false) + setters + merge coerce"
    - path: src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx
      provides: "Settings card with 4 checkboxes for optional menu sections"
    - path: src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx
      provides: "Conditional render of four menu Button+Separator blocks"
    - path: src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
      provides: "Four menu flags in userProfile export/import"
  key_links:
    - from: "MenuSectionsSettingsCard checkboxes"
      to: "userStore four menu flags"
      via: "setTimerMenuEnabled / setBodyMetricsMenuEnabled / setLoadTableMenuEnabled / setActivityMenuEnabled"
    - from: "userStore menu flags"
      to: "ProfileDropDownMenu items"
      via: "useUserStore selectors — render only when true"
    - from: "userStore menu flags"
      to: "app settings transfer userProfile section"
      via: "exportSnapshot / importSnapshot / isUserProfileExport"
---

<objective>
Сделать пункты меню Таймер, Параметры тела, Таблица нагрузок и Активность опциональными: показывать в меню только при включении в Настройках (D-01–D-04). Default OFF для начинающих. Persist + transfer как у aiFillEnabled. Роуты не трогать.

Purpose: Упростить меню для новичков — дополнительные разделы появляются только после явного включения.
Output: 4 флага в userStore, карточка настроек, условный рендер меню, transfer registry.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/entities/user/slice/userStore.ts
@src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx
@src/features/exercise/ui/ExerciseCardDisplaySettingsCard.tsx
@src/features/exercise/ui/WorkoutSummaryDisplaySettingsCard.tsx
@src/pages/SettingsPage/ui/SettingsPage.tsx
@src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
@src/features/profileDropDownMenu/index.ts
@.planning/quick/260715-3t7-ai-fill-feature-flag/260715-3t7-PLAN.md
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Settings UI → userStore | Локальные boolean-флаги видимости пунктов меню |
| Menu UI → routes | Скрытие пунктов не равно удалению маршрутов |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-TQU-01 | Information Disclosure | Optional menu always visible | low | mitigate | Default all four flags false; menu items not rendered when false |
| T-TQU-02 | Tampering | Persisted menu flags | low | mitigate | merge + transfer accept only boolean; else keep store default false |
| T-TQU-03 | Elevation of Privilege | Deep links to gated pages | low | accept | Intentional: hide menu only; routes remain reachable by URL |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Persist four menu flags in userStore + transfer</name>
  <files>src/entities/user/slice/userStore.ts, src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts</files>
  <action>
Добавить четыре фича-флага по образцу `aiFillEnabled` (D-01, D-04):

1. В `UserState` (все default `false`):
   - `timerMenuEnabled`
   - `bodyMetricsMenuEnabled`
   - `loadTableMenuEnabled`
   - `activityMenuEnabled`
2. В `ActionsState` + реализации: `setTimerMenuEnabled`, `setBodyMetricsMenuEnabled`, `setLoadTableMenuEnabled`, `setActivityMenuEnabled` — каждый через `set(() => ({ flag: enabled }))`.
3. В `persist.merge`: для каждого флага — если `typeof p.<flag> === "boolean"` взять значение, иначе `current.<flag>` (старые blob без поля → false).
4. В `appSettingsSectionRegistry.ts` секции `userProfile` зеркально с `aiFillEnabled`:
   - optional boolean в типах `isUserProfileExport` / export state / import prevState;
   - в `isUserProfileExport`: если ключ есть — требовать boolean;
   - в `exportSnapshot`: `<flag>: state.<flag> ?? false`;
   - в `importSnapshot` (merge existing и create new): `<flag>: payload.<flag> ?? prev/false` с тем же fallback-паттерном.

Не трогать accessToken и прочие флаги. Не менять роуты.
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false 2>&amp;1 | Select-Object -Last 30</automated>
  </verify>
  <done>
    userStore имеет четыре флага default false, setters и coalesce в merge; userProfile export/import переносит все четыре поля.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Settings card «Дополнительные разделы»</name>
  <files>src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx, src/features/profileDropDownMenu/index.ts, src/pages/SettingsPage/ui/SettingsPage.tsx</files>
  <action>
Создать карточку настроек по паттерну `ExerciseCardDisplaySettingsCard` (несколько чекбоксов в одной Card) (D-02):

1. Новый `MenuSectionsSettingsCard.tsx` в `profileDropDownMenu/ui/`:
   - Title: «Дополнительные разделы»; description: пункты появляются в меню профиля только после включения.
   - Иконка: `PanelLeft` или `Menu` из lucide-react.
   - Четыре ряда Checkbox+Label (ids: `menu-timer-enabled`, `menu-body-metrics-enabled`, `menu-load-table-enabled`, `menu-activity-enabled`):
     - «Таймер» → `timerMenuEnabled` / `setTimerMenuEnabled`
     - «Параметры тела» → `bodyMetricsMenuEnabled` / `setBodyMetricsMenuEnabled`
     - «Таблица нагрузок» → `loadTableMenuEnabled` / `setLoadTableMenuEnabled`
     - «Активность» → `activityMenuEnabled` / `setActivityMenuEnabled`
   - Короткие hint-тексты на русском (скрыт в меню, пока выкл.).
   - Стили только Tailwind-токенами (`border-border`, `text-muted-foreground`), `cn` как у соседних карточек.
2. Экспорт `MenuSectionsSettingsCard` из `src/features/profileDropDownMenu/index.ts` рядом с `ProfileDropDownMenu`.
3. В `SettingsPage.tsx`: импорт и монтаж после `TimerNotificationsSettingsCard` (или перед `SettingsTransferCard`) — рядом с прочими тумблерами отображения.
  </action>
  <verify>
    <automated>pnpm exec rg -n "MenuSectionsSettingsCard|timerMenuEnabled|bodyMetricsMenuEnabled|loadTableMenuEnabled|activityMenuEnabled" src/pages/SettingsPage/ui/SettingsPage.tsx src/features/profileDropDownMenu/index.ts src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx</automated>
  </verify>
  <done>
    На странице настроек есть карточка «Дополнительные разделы» с четырьмя чекбоксами, связанными со store; карточка экспортирована из feature barrel.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Gate four menu items by flags</name>
  <files>src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx</files>
  <action>
В `profileDropDownMenu.tsx` (D-03): подписаться на четыре флага через `useUserStore` (с `?? false`).

Для каждого из четырёх пунктов (Таймер → `/timer`, Параметры тела → `/body-metrics`, Таблица нагрузок → `/load-table`, Активность → `/activity`) рендерить блок `Separator` + `Button` только если соответствующий флаг `true`. Группировать Separator с пунктом (как соседний Separator перед кнопкой сейчас), чтобы при всех OFF не оставалось лишних разделителей между Главная и Список упражнений.

Не удалять и не комментировать маршруты в router. Не гейтить Главная, Список упражнений, Аналитика, Новости, Настройки. Не менять Popover/trigger.
  </action>
  <verify>
    <automated>pnpm exec rg -n "timerMenuEnabled|bodyMetricsMenuEnabled|loadTableMenuEnabled|activityMenuEnabled" src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx; pnpm exec tsc -b --pretty false 2>&amp;1 | Select-Object -Last 20</automated>
  </verify>
  <done>
    При всех флагах false в меню нет четырёх пунктов; при включении каждого — появляется соответствующий пункт; deep links на страницы по-прежнему работают.
  </done>
</task>

</tasks>

<verification>
- `pnpm exec tsc -b` проходит без ошибок по затронутым типам.
- Fresh persist без новых полей → coalesce к false → четыре пункта скрыты.
- Ручная проверка (executor в SUMMARY): Настройки → включить каждый флаг → пункт появляется в меню; выключить → исчезает; прямой URL страницы открывается.
</verification>

<success_criteria>
- Четыре флага default OFF (D-01).
- Settings card «Дополнительные разделы» с 4 чекбоксами (D-02).
- Меню скрывает пункты целиком при OFF (D-03).
- Persist + export/import профиля включают все четыре флага (D-04).
- Роуты не удалены.
</success_criteria>

<output>
Create `.planning/quick/260811-tqu-optional-menu-features/260811-tqu-SUMMARY.md` when done
</output>
