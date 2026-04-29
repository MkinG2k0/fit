# Project Research Summary

**Project:** Fit
**Domain:** Local-first веб-трекер силовых тренировок для новичков
**Researched:** 2026-04-14
**Confidence:** HIGH

## Executive Summary

Fit — это brownfield-продукт категории workout tracker, где успех определяется скоростью логирования между подходами и понятной визуализацией прогресса. Исследование сходится в одном: для v1 нужно усиливать core loop `выбрал упражнение -> записал сет -> увидел динамику`, а не расширять платформу в сторону соцсценариев, облачной синхронизации и сложной спортивной аналитики. Экспертный подход для такого этапа — сохранить текущий React + TypeScript + Zustand стек, усилить слой данных для истории тренировок и выделить feature-слои для quick log, categories и charts.ы

Рекомендованная стратегия реализации: минимальная архитектурная миграция без greenfield-переписывания. Данные тренировок и категорий остаются в entity-store, фичи работают через typed actions/selectors, orchestration выполняется на уровне widget. Для надежности и масштабирования истории необходимо уйти от зависимости на raw localStorage как долгосрочного источника истины и перейти к более устойчивой local-first persistence модели (Dexie/IndexedDB), сохранив текущие границы FSD и публичные API слайсов.

Ключевые риски уже видны: дубли логов из-за неидемпотентных действий, потеря данных в local storage сценариях, вводящая в заблуждение аналитика графиков и деградация производительности при росте истории. Их нужно снижать не точечными hotfix, а ранними фазами integrity/hardening: event idempotency, атомарные мутации, metric contract для графиков, pre-aggregation, а также guardrails на границы слоев и интеграционные тесты pipeline `log -> persist -> chart -> filter`.

## Key Findings

### Recommended Stack

Стек для ближайшего milestone должен быть эволюционным, а не революционным: React 19, TypeScript 6, Vite 8, React Router 7, Tailwind 4, Zustand 5. Для целевых фич этого milestone критичны три технических опоры: формы через `react-hook-form + zod`, аналитика прогресса через Recharts 3.8 и устойчивая local-first persistence через Dexie. Такой набор дает быструю UI-итерацию и контролируемый рост доменной модели без переусложнения.

**Core technologies:**

- React 19 + React Router 7: базовый runtime и навигация без миграционного риска для текущего приложения.
- TypeScript 6: строгая типизация доменных контрактов (`exercise -> sets -> history`) и более устойчивый рефакторинг.
- Zustand 5: единый слой локального доменного состояния без избыточного boilerplate.
- Dexie + IndexedDB: надежное хранение растущей истории тренировок и query-friendly доступ к данным.
- react-hook-form + zod: быстрый ввод сетов с runtime-валидацией и низкой стоимостью рендеров.
- Recharts 3.8: достаточная визуальная аналитика для MVP (вес/повторы/объем) без тяжеловесной графической платформы.

### Expected Features

Исследование фич четко отделяет table stakes от differentiators. Для v1 обязательны быстрый лог подходов, автоподстановка прошлых значений, шаблоны/рутины, базовые графики, категоризация упражнений, история/календарь и экспорт данных. Конкурентное преимущество (инсайты, умные подсказки прогрессии, тепловые карты) имеет смысл строить только после стабилизации базового контура.

**Must have (table stakes):**

- Быстрый лог сетов (вес/повторы) в 1-2 действия.
- Автоподстановка прошлых значений по упражнению.
- Категоризация упражнений + быстрый выбор/фильтрация.
- История тренировок + календарный просмотр.
- Базовые графики прогресса (вес/повторы/объем).
- Экспорт данных (JSON/CSV) как защита local-first доверия.

**Should have (competitive):**

- Rule-based рекомендации прогрессии на основе последних сессий.
- Недельный digest с ключевыми изменениями в нагрузке.
- Тепловая карта нагрузки по группам мышц.
- Готовые beginner-планы в один клик.

**Defer (v2+):**

- Cloud sync и аккаунты.
- Социальные механики (лента, лайки, подписки).
- Продвинутая метрика по умолчанию (RPE/RIR/readiness).
- AI-генерация сложных программ на старте.

### Architecture Approach

Архитектура должна развиваться вокруг текущих FSD-слоев: entities владеют доменными данными и мутациями, features реализуют user flows, widget связывает category -> quick log -> chart, pages остаются тонкими. Критичный паттерн — selector-first analytics: вся агрегация прогресса уходит в `model/selectors`, а UI получает уже готовые серии. Это устраняет прямые чтения storage в компонентах и снижает риск расхождений данных.

**Major components:**

1. `entities/calendarDay` (evolve to workout-log): источник истины для логов, истории и агрегатов.
2. `entities/exercise`: каталог упражнений/категорий и операции CRUD.
3. `features/categoryList`: выбор/фильтрация категорий и вход в создание категории.
4. `features/quickLog`: быстрый ввод и редактирование сетов через entity actions.
5. `features/progressChart`: фильтры периода/метрики + рендер готовых рядов.
6. `widgets/workoutWorkspace`: orchestration единого пользовательского потока.

### Critical Pitfalls

1. **Неидемпотентный quick log и дубли данных** — ввести `eventId`, атомарную запись и блокировку повторной отправки до завершения операции.
2. **Потеря данных local-first** — обернуть persistence в `try/catch`, добавить schema versioning, backup export/import и мониторинг quota.
3. **Ложные выводы из графиков** — зафиксировать metric contract (`topSetWeight`, `topSetReps`, `volume`) и явные подписи агрегации.
4. **Просадка производительности графиков** — pre-aggregation, memoized selectors, downsampling и лимит окна по умолчанию.
5. **Дрейф таксономии категорий** — canonical registry с immutable id, нормализация ввода и контролируемые миграции при rename.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Domain Contracts & Persistence Hardening

**Rationale:** Без устойчивого слоя данных любая UX-фича будет нестабильной и даст регрессии.
**Delivers:** Typed selectors/actions, safe persistence adapter, schema versioning, backup/export baseline.
**Addresses:** Надежность core data flow для всех table-stakes фич.
**Avoids:** Data loss, duplicate logs, fragile store boundaries.

### Phase 2: Category Taxonomy Foundation

**Rationale:** Категории — upstream зависимость для быстрого выбора упражнения и аналитики по группам.
**Delivers:** Canonical category registry, нормализация, UI выбора/поиска категорий, controlled create/rename.
**Uses:** Zustand entities + существующие createCategory/createExercise точки входа.
**Implements:** `features/categoryList` + селекторы `entities/exercise`.

### Phase 3: Quick Log Experience

**Rationale:** Это core value и главный retention драйвер для beginner-аудитории.
**Delivers:** Быстрый ввод сетов, автоподстановка прошлых значений, защита от дублей, предсказуемый flow.
**Addresses:** Must-have quick logging + autofill.
**Avoids:** Non-idempotent writes и каскадные баги при частых мутациях.

### Phase 4: Progress Analytics Contract & Charts

**Rationale:** Визуальная обратная связь нужна сразу после стабилизации reliable logging.
**Delivers:** Selector-first агрегации, metric contract, Recharts UI с фильтрами периодов и корректными empty/no-data состояниями.
**Uses:** Recharts 3.8 + entity selectors.
**Implements:** `features/progressChart` и постепенная замена старого `statisticCard` path.

### Phase 5: Workspace Composition & UX Polish

**Rationale:** Финальная ценность появляется в связном сценарии, а не в отдельных компонентах.
**Delivers:** `workoutWorkspace` (category -> quick log -> chart), route integration, integration/e2e tests ключевого pipeline.
**Addresses:** Целостный пользовательский опыт MVP.
**Avoids:** Cross-feature regressions и FSD boundary violations.

### Phase Ordering Rationale

- Порядок следует графу зависимостей: `entity contracts -> category foundation -> quick log -> charts -> workspace integration`.
- Grouping соответствует архитектуре: сначала стабилизируем entities/model, затем поднимаемся в features и widget orchestration.
- Ранний hardening снижает стоимость последующих фаз и предотвращает накопление данных, которые позже трудно мигрировать.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1 (Persistence Hardening):** выбор и миграция local-first persistence (Dexie rollout, совместимость и миграции данных).
- **Phase 4 (Progress Analytics Contract & Charts):** валидация metric semantics и UX-подачи аналитики для новичков.
- **Phase 5 (Integration & test strategy):** определение минимального, но достаточного e2e покрытия на браузерных сценариях.

Phases with standard patterns (skip research-phase):

- **Phase 2 (Category Taxonomy Foundation):** хорошо документированные паттерны нормализации словаря и controlled CRUD.
- **Phase 3 (Quick Log Experience):** стандартные UI-паттерны форм + idempotent actions в рамках текущей архитектуры.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                   |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Основано на официальных release/docs и совместимо с текущим brownfield-контекстом проекта.                              |
| Features     | MEDIUM     | Сильная межпродуктовая консистентность, но часть аргументации опирается на маркетинговые страницы и обзорные источники. |
| Architecture | HIGH       | Выводы подтверждены текущими store/слоями и реальными точками интеграции в кодовой базе.                                |
| Pitfalls     | HIGH       | Риски подтверждаются внутренним контекстом проекта + официальной документацией storage.                                 |

**Overall confidence:** HIGH

### Gaps to Address

- **Retention validation:** подтвердить приоритет differentiators (digest/insights/heatmap) через интервью/usage telemetry до включения в roadmap.
- **Persistence migration scope:** оценить стратегию миграции существующих данных из localStorage в IndexedDB без потерь.
- **Chart UX semantics:** валидировать формулировки метрик и подписи агрегаций на реальных пользовательских сценариях новичков.
- **Performance budget:** зафиксировать целевые пороги рендера статистики на длинной истории и добавить профилирование в definition of done.

## Sources

### Primary (HIGH confidence)

- `.planning/PROJECT.md` — продуктовые ограничения, scope и приоритеты.
- `.planning/codebase/CONCERNS.md` — внутренние архитектурные/рисковые сигналы.
- [React releases](https://github.com/facebook/react/releases) — актуальная ветка React.
- [TypeScript releases](https://github.com/microsoft/TypeScript/releases) — актуальная ветка TS.
- [Vite releases](https://vite.dev/releases) — актуальная ветка Vite.
- [React Router docs](https://reactrouter.com/home) — routing guidance.
- [Tailwind + Vite setup](https://tailwindcss.com/docs/installation/using-vite) — официальная интеграция.
- [Dexie React tutorial](https://dexie.org/docs/Tutorial/React) — local-first persistence patterns.
- [React Hook Form docs](https://react-hook-form.com/get-started) — form architecture.
- [Zod docs](https://zod.dev/) — runtime schema validation.
- [MDN Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — ограничения и eviction.
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — поведение и исключения.

### Secondary (MEDIUM confidence)

- [Recharts guide](https://recharts.github.io/en-US/guide) — практики построения графиков для MVP аналитики.
- [Chart.js decimation](https://www.chartjs.org/docs/latest/configuration/decimation.html) — переносимые принципы оптимизации больших рядов.
- [JEFIT use case](https://www.jefit.com/use-case/workout-tracker) — сверка table-stakes паттернов категории.
- [Strong](http://www.strongapp.io/) — сверка UX quick logging и прогресса.
- [Hevy features](https://www.hevyapp.com/features/) — сверка feature baseline.

### Tertiary (LOW confidence)

- Обзорные web-материалы 2026 по workout trackers — использованы как directional signals и требуют валидации в продуктовых интервью.

---

_Research completed: 2026-04-14_  
_Ready for roadmap: yes_
