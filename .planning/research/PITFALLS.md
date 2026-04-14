# Domain Pitfalls

**Domain:** Workout tracking app (quick logging, progression charts, exercise categories)
**Researched:** 2026-04-14

## Critical Pitfalls

### Pitfall 1: Duplicate logs and non-idempotent quick actions
**What goes wrong:** Один и тот же сет/упражнение сохраняется несколько раз из-за повторных нажатий, retry или гонок состояния.  
**Why it happens:** Нет idempotency-key на событие логирования и атомарного контракта записи.  
**Consequences:** Искаженный объём тренировки, неверные графики прогресса, потеря доверия к данным.

**Warning signs**
- Дубли сетов с близкими timestamp
- Резкие необъяснимые пики объёма
- Частые ручные удаления «лишних» подходов

**Prevention strategy**
- Вводить `eventId` на каждое действие логирования и отклонять дубли
- Делать запись атомарной (один use-case: log -> validate -> persist)
- Блокировать повторную отправку до завершения операции
- Добавить инвариантные тесты на дедупликацию

**Phase should address:** Phase `Quick Log Integrity`

---

### Pitfall 2: Data loss from local-first storage limits/corruption
**What goes wrong:** История тренировок частично или полностью пропадает (quota, eviction, повреждённый JSON, приватный режим).  
**Why it happens:** Хранение критичных данных только в `localStorage` без safe-guards и recovery path.  
**Consequences:** Потеря пользовательского прогресса и невозможность восстановить журнал.

**Warning signs**
- `QuotaExceededError` в runtime
- Падение гидрации на `JSON.parse`
- «Пустая история» после перезапуска/очистки

**Prevention strategy**
- Обернуть чтение/запись в `try/catch` + fallback schema versioning
- Сделать batched/debounced persistence вместо частых full rewrites
- Добавить экспорт/импорт бэкапа (минимум JSON)
- Мониторить `navigator.storage.estimate()` и заранее предупреждать пользователя

**Phase should address:** Phase `Persistence Hardening`

---

### Pitfall 3: Misleading progression charts (wrong aggregation/context)
**What goes wrong:** Графики показывают «ложный прогресс» или «ложный регресс» из-за смешения метрик, пропусков и неконсистентных окон агрегации.  
**Why it happens:** Нет явного аналитического контракта: какая метрика строится, с какой агрегацией, в каком временном окне.  
**Consequences:** Пользователь принимает неверные тренировочные решения.

**Warning signs**
- Один и тот же период даёт разные значения в разных экранах
- Линия резко «прыгает» после пропусков логов
- Пользователь не понимает, что именно отображается (max/top set/volume)

**Prevention strategy**
- Зафиксировать metric contract: `topSetWeight`, `topSetReps`, `volume`
- Показывать подпись агрегации на графике (например, weekly max)
- Разделять «нет данных» и «нулевое значение»
- Добавить snapshot-тесты аналитических селекторов

**Phase should address:** Phase `Progress Analytics Contract`

---

### Pitfall 4: Chart performance collapse on growing history
**What goes wrong:** Экран статистики тормозит при росте истории, особенно на мобильных браузерах.  
**Why it happens:** Рендер всех точек + пересчёт производных на каждый рендер.  
**Consequences:** Медленный UX, пропуски кадров, отказ от функции графиков.

**Warning signs**
- Задержки открытия статистики >1-2 сек
- Фризы при смене упражнения/периода
- Высокая нагрузка CPU на больших датасетах

**Prevention strategy**
- Предагрегировать данные (день/неделя) перед отрисовкой
- Мемоизировать селекторы и вычисления трендов
- Включить decimation/downsampling для line charts при больших рядах
- Лимитировать диапазон по умолчанию (например, последние 12 недель)

**Phase should address:** Phase `Chart Performance`

---

### Pitfall 5: Category taxonomy drift (duplicates, ambiguity, filter chaos)
**What goes wrong:** Категории размножаются и конфликтуют (`Legs`, `legs`, `Lower Body`), фильтрация становится непредсказуемой.  
**Why it happens:** Нет канонического словаря категорий и стабильных ID.  
**Consequences:** Плохая навигация, неверная группировка упражнений, сложная миграция.

**Warning signs**
- Быстро растёт число почти одинаковых категорий
- Много «Uncategorized»
- Одни и те же упражнения попадают в разные категории у разных пользователей

**Prevention strategy**
- Ввести category registry (immutable `id` + display name + aliases)
- Нормализовать ввод (slug, trim, case folding)
- Разрешить только controlled creation/rename с миграцией связей
- Добавить правило «один primary category + опциональные tags»

**Phase should address:** Phase `Category Taxonomy Foundation`

---

### Pitfall 6: Extending features on fragile store boundaries
**What goes wrong:** Быстрые доработки логирования/категорий/графиков ломают существующие сценарии редактирования дней и упражнений.  
**Why it happens:** Хрупкий store, прямые внутренние импорты между слайсами, недостаток тестов на бизнес-поток.  
**Consequences:** Частые регрессии в core flow и удорожание каждой следующей фичи.

**Warning signs**
- Любая мелкая правка вызывает каскадные баги в соседних экранах
- Бизнес-логика расползается по UI-компонентам
- Растёт число hotfix без корневого исправления

**Prevention strategy**
- Зафиксировать FSD boundaries (только public `index.ts` imports)
- Вынести бизнес-операции в model/lib (не в JSX)
- Добавить e2e/интеграционные тесты для pipeline: log -> persist -> chart -> filter
- Принять policy: новые фичи только через typed domain API

**Phase should address:** Phase `Architecture Guardrails`

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Quick logging UX | Дубли и race-condition при записи | Event idempotency + atomic mutation flow |
| Local persistence | Потеря данных из-за quota/parse failures | Safe storage layer + backup/export + quota monitoring |
| Progress charts | Ошибочная интерпретация прогресса | Metric contract + explicit aggregation labels |
| Chart rendering | Просадка производительности на длинной истории | Pre-aggregation + memoization + decimation |
| Categories | Семантический дрейф и дубли | Canonical registry + aliases + migration rules |
| Cross-feature integration | Регрессии из-за слабых границ слоёв | FSD import guards + integration tests |

## Sources

- Internal project context: `.planning/PROJECT.md` (HIGH)
- Internal codebase risk audit: `.planning/codebase/CONCERNS.md` (HIGH)
- MDN Web Storage quotas and eviction criteria (HIGH): https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN `localStorage` behavior/exceptions (HIGH): https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Chart.js data decimation guidance (MEDIUM, chart-lib specific): https://www.chartjs.org/docs/latest/configuration/decimation.html
- Ecosystem scanning via web search (LOW, directional only): quick logging sync pitfalls / fitness chart mistakes / taxonomy modeling articles (validated selectively against official docs where possible)
