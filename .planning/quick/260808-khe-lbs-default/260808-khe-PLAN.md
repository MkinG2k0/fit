---
phase: 260808-khe-lbs-default
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/entities/exercise/model/types.ts
  - src/entities/exercise/model/measurementTypes.ts
  - src/entities/exercise/lib/normalizeExerciseCategories.ts
  - src/entities/exercise/slice/exerciseStore.ts
  - src/entities/exercise/index.ts
  - src/shared/config/constants.ts
  - src/features/createExercise/model/types.ts
  - src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx
  - src/features/createExercise/ui/CreateExercise.tsx
  - src/features/exercise/ui/MeasurementTypeSettingsCard.tsx
  - src/features/exercise/ui/ExerciseSetRow.tsx
  - src/features/exercise/ui/ExerciseBody.tsx
  - src/features/exercise/index.ts
  - src/pages/SettingsPage/ui/SettingsPage.tsx
  - src/shared/lib/findLastExerciseSession.ts
  - src/features/exercise/ui/ExerciseCard.tsx
autonomous: true
requirements:
  - QUICK-KHE-01
  - QUICK-KHE-02
  - QUICK-KHE-03
  - QUICK-KHE-04
must_haves:
  truths:
    - "При создании упражнения можно выбрать тип замера; по умолчанию — свободный вес."
    - "В логировании подхода UI зависит от типа: свободный вес (любая цифра), стек lbs/кг с шагом, время мм:сс."
    - "Дефолтный каталог в constants уже размечен типами (кардио/планка → время, блочные тренажёры → stack_kg, силовые со свободным весом → free_weight)."
    - "В Настройках можно сменить тип только у каталожных упражнений с текущим типом свободный вес."
  artifacts:
    - path: src/entities/exercise/model/measurementTypes.ts
      provides: "MeasurementType union, defaults, normalize, step helpers, duration mm:ss codec"
    - path: src/shared/config/constants.ts
      provides: "Built-in catalog entries tagged with measurementType (+ step for stacks)"
    - path: src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx
      provides: "Type picker on create (default free_weight)"
    - path: src/features/exercise/ui/MeasurementTypeSettingsCard.tsx
      provides: "Settings UI to change type for free_weight catalog exercises"
    - path: src/features/exercise/ui/ExerciseSetRow.tsx
      provides: "Per-type set input (decimal / stepped stack / mm:ss)"
  key_links:
    - from: "CatalogExercise.measurementType"
      to: "ExerciseSetRow inputs"
      via: "catalogExerciseId → findCatalogExerciseById → measurementType (fallback free_weight)"
    - from: "CreateExerciseMeasurementSection"
      to: "exerciseStore.createExercise / updateExercise"
      via: "NewExercise.measurementType (+ measurementStep for stacks)"
    - from: "MeasurementTypeSettingsCard"
      to: "exerciseStore.updateExercise"
      via: "only when current type is free_weight"
    - from: "time set weight field"
      to: "ExerciseSet.weight"
      via: "total seconds; reps stay 0 for pure duration sets"
---

<objective>
Добавить типы замеров упражнений: свободный вес, стеки lbs/кг с шагом, время мм:сс — с выбором при создании (default свободный вес), разметкой дефолтного каталога и сменой типа в настройках для упражнений со свободным весом.

Purpose: Новичок логирует подходы в формате, который соответствует снаряду/кардио, без ломки существующего журнала (вес/повторы остаются числовыми полями `ExerciseSet`).
Output: Типы + нормализация + дефолты, UI создания/настроек, UI строки подхода по типу.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/PROJECT.md
@src/entities/exercise/model/types.ts
@src/entities/exercise/lib/normalizeExerciseCategories.ts
@src/entities/exercise/slice/exerciseStore.ts
@src/shared/config/constants.ts
@src/features/createExercise/ui/CreateExercise.tsx
@src/features/createExercise/model/types.ts
@src/features/exercise/ui/ExerciseSetRow.tsx
@src/features/exercise/ui/ExerciseBody.tsx
@src/features/exercise/ui/DefaultExercisesSettingsCard.tsx
@src/pages/SettingsPage/ui/SettingsPage.tsx
@src/shared/lib/findLastExerciseSession.ts
@src/features/exercise/ui/ExerciseCard.tsx
@src/shared/ui/shadCNComponents/ui/radio-group.tsx
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Модель measurementType + дефолтный каталог + store</name>
  <files>src/entities/exercise/model/types.ts, src/entities/exercise/model/measurementTypes.ts, src/entities/exercise/lib/normalizeExerciseCategories.ts, src/entities/exercise/slice/exerciseStore.ts, src/entities/exercise/index.ts, src/shared/config/constants.ts, src/features/createExercise/model/types.ts</files>
  <action>
1. Создать `src/entities/exercise/model/measurementTypes.ts`:
   - Union `MeasurementType = "free_weight" | "stack_lbs" | "stack_kg" | "time"`.
   - Константа default `FREE_WEIGHT_MEASUREMENT_TYPE = "free_weight"`.
   - `normalizeMeasurementType(raw: unknown): MeasurementType` — неизвестное/пустое → `free_weight`.
   - `defaultMeasurementStep(type: MeasurementType): number | undefined` — для `stack_kg` → `5`, для `stack_lbs` → `10`, иначе `undefined`.
   - `normalizeMeasurementStep(type, raw): number | undefined` — для стеков: конечное число &gt; 0, иначе default step; для non-stack → `undefined`.
   - Хелперы времени: `formatSecondsAsMmSs(totalSeconds: number): string` и `parseMmSsToSeconds(draft: string): number | null` (допускать `m:ss` / `mm:ss`, пустая строка → 0; невалидное → null). Хранилище длительности — целые секунды в `ExerciseSet.weight` (без нового поля в сете).
   - `isStackMeasurementType` / `isTimeMeasurementType` булевы хелперы.

2. Расширить `CatalogExercise` в `types.ts`: обязательные с точки зрения нормализации поля `measurementType: MeasurementType` и опциональное `measurementStep?: number` (только для стеков). Session `Exercise` тип не дублирует measurementType — резолв из каталога по `catalogExerciseId`.

3. В `normalizeCatalogEntry` (`normalizeExerciseCategories.ts`): читать `measurementType` / `measurementStep` из raw object; при отсутствии — `free_weight`; степ нормализовать через хелперы. Строковый legacy-entry → `free_weight`.

4. Обновить `catalogExercise(...)` в `constants.ts`: добавить опциональные args `measurementType` и `measurementStep` (default `free_weight`). Разметить встроенный каталог (discretion, явным списком в коде):
   - **time:** все упражнения категории «Кардио»; «Планка»; три упражнения «Мобильность» (удержание).
   - **stack_kg** (step 5): машинные/блочные — «Жим ногами», «Разгибания ног в тренажере сидя», «Сгибания ног в тренажере сидя», «Сгибания ног в тренажере лежа», «Отведение ноги в кроссовере», все «Тяга верхнего блока *», «Тяга горизонтального блока», «Бабочка на скамье, разведение рук», «Сведение рук в кроссовере», «Бабочка на скамье, сведение рук», «Разведения рук в стороны в тренажёре», «Подъём гантелей на бицепс в тренажере», «Разгибания на блоке», «Подъемы на носки в тренажере».
   - **free_weight:** всё остальное (штанга/гантели/свой вес).
   - **stack_lbs:** в дефолтном каталоге не назначать (тип доступен при создании/в настройках).

5. `createExercise` / `updateExercise` в `exerciseStore.ts`: принимать и персистить `measurementType` + optional `measurementStep`. При create без типа — `free_weight`. Экспорт типов/хелперов из `entities/exercise/index.ts`.

6. Расширить `NewExercise` и `CatalogExerciseEditSource` в `createExercise/model/types.ts` полями `measurementType` и `measurementStep?`.

Не менять форму `ExerciseSet` (id/weight/reps/...). Не добавлять CSS Modules. Не трогать load-table / AI fill в этой задаче.
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>CatalogExercise имеет measurementType; старый persist без поля нормализуется в free_weight; constants размечен; store create/update пишут тип и шаг.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Выбор типа при создании + смена в настройках</name>
  <files>src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx, src/features/createExercise/ui/CreateExercise.tsx, src/features/exercise/ui/MeasurementTypeSettingsCard.tsx, src/features/exercise/index.ts, src/pages/SettingsPage/ui/SettingsPage.tsx, src/entities/exercise/slice/exerciseStore.ts</files>
  <action>
1. Новый `CreateExerciseMeasurementSection.tsx`: RadioGroup (уже есть `@/shared/ui/shadCNComponents/ui/radio-group`) с четырьмя опциями и русскими лейблами: «Свободный вес», «Стек (кг)», «Стек (lbs)», «Время». Default при create — `free_weight`. При выборе стека показать number input «Шаг» (seed из `defaultMeasurementStep`). Tailwind tokens only, классы inline в JSX. Props: value, step, onTypeChange, onStepChange, disabled? .

2. В `CreateExercise.tsx`: включить секцию в форму; `buildReset` / `buildInitial` / payloads create+update передают `measurementType` (+ step). При редактировании: если текущий тип уже не `free_weight`, показать тип read-only (disabled RadioGroup) — смена не-free_weight только через будущие сценарии не требуется; смена разрешена когда текущий тип `free_weight` (согласовано с настройками).

3. Новый `MeasurementTypeSettingsCard.tsx` по образцу `DefaultExercisesSettingsCard`: карточка на Settings «Тип замера». Список каталожных упражнений с `measurementType === free_weight` (имя + категория). Для каждой строки — select/radio смены на stack_kg / stack_lbs / time / оставить free_weight; при выборе стека — шаг (default). Вызов `updateExercise` с полным текущим payload (name/category/icon/description/photos + новые measurement поля). Упражнения с time/stack в карточке не показывать (только free_weight).

4. Подключить карточку в `SettingsPage.tsx` рядом с `DefaultExercisesSettingsCard`; export из `features/exercise/index.ts`.

5. Если `updateExercise` ещё не прокидывает measurement поля — добить сигнатуру из Task 1.

Стили: только Tailwind в className, токены приоритетнее хардкода. pnpm-only (не npm).
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>Create default free_weight с выбором типа; Settings меняет тип только у free_weight каталога; updateExercise сохраняет выбор.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: UI логирования подхода по типу замера</name>
  <files>src/features/exercise/ui/ExerciseSetRow.tsx, src/features/exercise/ui/ExerciseBody.tsx, src/shared/lib/findLastExerciseSession.ts, src/features/exercise/ui/ExerciseCard.tsx</files>
  <action>
1. В `ExerciseBody`: резолвить `measurementType` (+ step) через `findCatalogExerciseById(useExerciseStore.exercises, exercise.catalogExerciseId)`; fallback `free_weight`. Передать в `ExerciseSetRow`.

2. `ExerciseSetRow` ветвление UI (сохраняя текущий draft-string decimal path для free_weight из 260715-vrc):
   - **free_weight:** текущие поля reps + weight (placeholder «Кг»), без регресса десятичного ввода.
   - **stack_kg / stack_lbs:** reps как сейчас; вес — дискретный контроль (кнопки −/+/или input, который снаппит к кратным `measurementStep`); placeholder «кг» или «lbs» по типу; значение по-прежнему пишется в `set.weight` через существующий `onInputChange` / `setExerciseValues`.
   - **time:** одно поле длительности мм:сс (draft string while focused); commit → секунды в `weight`; колонку reps скрыть или задизейблить (reps оставлять 0). Empty set: weight 0 и reps 0. `isSetEmpty` / фокус-логика учитывать time (пусто = 0 секунд).

3. Подсказки прошлой сессии: в `formatSetCompact` (`findLastExerciseSession.ts`) принимать optional measurementType (прокинуть из `useLastExerciseSession` / hint, если уже есть доступ к catalog id) — для time показывать `mm:ss`, для stack_lbs суффикс lbs, иначе текущий формат. Если прокидка типа слишком расползается — минимум: при weight&gt;0 и reps===0 форматировать как mm:ss только когда caller передал type time; иначе не ломать силовые 0-rep кейсы.

4. Объём в шапке карточки (`ExerciseCard` tonnage reduce): если measurementType === time, не добавлять `calcSetVolumeKg` за подход (иначе секунды попадут в «кг»). Для стеков считать volume как сейчас (weight×reps). Резолв типа через catalogExerciseId.

Не менять схему persist журнала. Не добавлять новые зависимости. Out of scope: переписывать AI fill промпты, load-table, аналитические графики целиком (только явный баг объёма time в карточке).
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>Строка подхода рендерит free_weight / stack step / mm:ss по каталогу; time не раздувает объём карточки; tsc чистый.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Settings/Create UI → exerciseStore persist | Пользователь задаёт measurementType/step в локальный каталог |
| Catalog measurementType → set logging UI | Тип влияет на интерпретацию `ExerciseSet.weight` (кг vs секунды) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-KHE-01 | Tampering | persisted measurementType | low | mitigate | `normalizeMeasurementType` / step coerce на hydrate; unknown → free_weight |
| T-KHE-02 | Elevation of Privilege | N/A local-only | low | accept | Нет серверных прав; данные только localStorage |
| T-KHE-03 | Denial of Service | mm:ss / step parse | low | mitigate | Отклонять невалидный ввод; step &gt; 0 finite; секунды ≥ 0 |
| T-KHE-SC | Tampering | package installs | high | accept | Новых npm/pnpm пакетов в плане нет |
</threat_model>

<verification>
- `pnpm exec tsc -b --pretty false` проходит.
- Create: новый exercise без смены типа → free_weight; смена на time/stack сохраняется в каталоге.
- Logging: free_weight принимает 12.5; stack снаппит к шагу; time сохраняет секунды и показывает mm:ss.
- Settings: в списке только free_weight; после смены на time упражнение исчезает из списка карточки.
- Sync default exercises подтягивает размеченные типы из constants.
</verification>

<success_criteria>
- Четыре типа замера реализованы end-to-end (модель → create → settings → set row).
- Дефолтный каталог размечен без ручного действия пользователя.
- Свободный вес остаётся default и текущим UX для силовых.
- Журнал подходов совместим (те же поля weight/reps).
</success_criteria>

<output>
Create `.planning/quick/260808-khe-lbs-default/260808-khe-SUMMARY.md` when done
</output>
