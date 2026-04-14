# Phase 1: Quick Logging Core & Local Persistence - Research

**Researched:** 2026-04-14  
**Domain:** Быстрый лог сетов (вес/повторы) + надежное локальное хранение в браузере [VERIFIED: codebase review]  
**Confidence:** HIGH

## Summary

Phase 1 уже частично реализован в коде через `useCalendarStore`, где сеты добавляются/редактируются/удаляются, а запись уходит в `localStorage` по ключам формата `MM-YYYY`. [VERIFIED: codebase review] Текущая реализация закрывает базовый happy-path, но делает persistence вручную (`JSON.parse/JSON.stringify` без защитного слоя), что повышает риск падений при битых данных и проблемах квоты. [VERIFIED: codebase review] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria]

Для качественного планирования Phase 1 нужно не менять архитектурный слой (FSD + Zustand), а стабилизировать доменный контур quick-log: выделить typed actions/selectors, добавить безопасный storage adapter с `try/catch`, внедрить явные UX-состояния для `LOG-04` и ошибок сохранения из UI-SPEC. [VERIFIED: codebase review] [VERIFIED: UI-SPEC] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage]

Также требуется заложить Wave 0 для тестов (сейчас тест-инфраструктура отсутствует), иначе критерии LOG/DATA останутся непроверяемыми автоматически. [VERIFIED: package.json + glob scan] [CITED: https://vitest.dev/guide/]

**Primary recommendation:** Использовать `zustand` + `persist` и единый safe-storage слой для календарных логов, добавить `react-hook-form`+`zod` для ввода сетов и закрыть Phase 1 через unit/integration тесты на сценарии LOG-01..04 и DATA-01. [VERIFIED: npm registry] [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md] [CITED: https://react-hook-form.com/get-started] [CITED: https://zod.dev/basics]

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOG-01 | Лог сета (вес+повторы) за 1-2 действия | RHF+zod форма + action-first store API + UX CTA из UI-SPEC |
| LOG-02 | Несколько сетов в одной сессии | append-set action c наследованием last set и стабилизацией id |
| LOG-03 | Редактирование/удаление любого сета | update/delete actions + confirm destructive flow из UI-SPEC |
| LOG-04 | Подсказка предыдущего значения | selector `getPreviousSetSuggestion(exerciseName)` + label `Предыдущий: ...` |
| DATA-01 | Данные сохраняются между сессиями | persist middleware + safe local storage adapter + rehydrate checks |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.1.1 (installed), 19.2.5 current | UI runtime | Уже в проекте; без миграции для Phase 1. [VERIFIED: package.json] [VERIFIED: npm registry] |
| zustand | 5.0.8 (installed), 5.0.12 current | Domain state + actions | Уже используется в entities; `persist` официально поддерживается. [VERIFIED: package.json] [VERIFIED: npm registry] [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md] |
| zustand/middleware persist | bundled with zustand | Локальная персистентность стора | Убирает hand-rolled сериализацию на каждом действии. [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md] |
| dayjs | 1.11.18 | Date-key и форматирование | Уже встроен в текущие key-стратегии `DD-MM-YYYY`/`MM-YYYY`. [VERIFIED: package.json] [VERIFIED: codebase review] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.72.1 | Управление формой ввода веса/повторов | Для сценария LOG-01 без бизнес-логики в JSX. [VERIFIED: npm registry] [CITED: https://react-hook-form.com/get-started] |
| zod | 4.3.6 | Runtime validation payload set | Для allowlist-валидации чисел/диапазонов. [VERIFIED: npm registry] [CITED: https://zod.dev/basics] |
| @hookform/resolvers | 5.2.2 | Интеграция RHF с Zod | Для единого валидационного контура. [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage via persist | IndexedDB/Dexie | Надежнее на больших объемах, но больше scope для Phase 1. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria] |
| RHF + zod | Ручные `useState` + inline checks | Быстрее старт, но хуже масштабируемость и выше риск бизнес-логики в JSX. [VERIFIED: codebase review] |

**Installation:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Version verification:**  
- `zustand` 5.0.12, modified 2026-03-16 [VERIFIED: npm registry]  
- `react` 19.2.5, modified 2026-04-13 [VERIFIED: npm registry]  
- `react-hook-form` 7.72.1, modified 2026-04-03 [VERIFIED: npm registry]  
- `zod` 4.3.6, modified 2026-01-25 [VERIFIED: npm registry]  
- `@hookform/resolvers` 5.2.2, modified 2025-09-14 [VERIFIED: npm registry]

## Project Constraints (from AGENTS.md + session rules)

- FSD направление зависимостей: `app -> pages -> widgets -> features -> entities -> shared`; cross-slice imports запрещены. [VERIFIED: AGENTS.md + user rules]  
- Public API через `index.ts` в каждом slice; импорт внутренних файлов напрямую запрещен. [VERIFIED: user rules]  
- Для форм использовать `react-hook-form`; бизнес-логика не в JSX. [VERIFIED: user rules]  
- Tailwind-only для новых изменений; CSS Modules не добавлять. [VERIFIED: user rules]  
- `any` запрещен; публичные API с явными TS-return types. [VERIFIED: user rules]  
- В репозитории нет `.cursor/rules/`; дополнительных file-scoped директив не обнаружено. [VERIFIED: glob scan]

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── features/quickLog/           # ui + lib/hooks + model (input/edit/delete set flow)
├── entities/calendarDay/        # source of truth for day->exercises->sets
├── shared/lib/storage/          # safe storage adapter + serializers
└── widgets/exerciseList/        # orchestration + composition only
```

### Pattern 1: Action-First Store Mutations
**What:** Все изменения сетов выполняются через action-методы стора, UI только вызывает handlers. [VERIFIED: codebase review]  
**When to use:** Для LOG-01/02/03 во всех сценариях изменения set/exercise. [VERIFIED: requirements mapping]  
**Example:**
```typescript
// Source: existing code pattern (calendarStore)
const addSetToExercise = (exercise) =>
  set((state) => {
    const { dateKey, oldExercises } = getDateKeyAndOldExercises(state.selectedDate, state.days);
    const lastSet = exercise.sets[exercise.sets.length - 1] ?? { id: "0", weight: 0, reps: 0 };
    const newExercises = oldExercises.map((ex) =>
      ex.id !== exercise.id
        ? ex
        : {
            ...ex,
            sets: [...ex.sets, { id: crypto.randomUUID(), weight: lastSet.weight, reps: lastSet.reps }],
          },
    );
    return { days: replaceExercises(state.selectedDate, state.days, dateKey, newExercises) };
  });
```

### Pattern 2: Safe Storage Boundary
**What:** Любой `getItem/setItem` проходит через обертку с `try/catch` и fallback. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage]  
**When to use:** DATA-01, boot/re-hydration, write-path quick log. [VERIFIED: requirements mapping]  
**Example:**
```typescript
// Source: recommended adaptation based on MDN localStorage exceptions/quota docs
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
```

### Pattern 3: Suggestion Selector for LOG-04
**What:** Подсказка предыдущего сета вычисляется селектором из сохраненной истории, не в JSX. [VERIFIED: user rules]  
**When to use:** При создании нового сета и при повторном выборе упражнения. [VERIFIED: UI-SPEC + requirements]  
**Example:**
```typescript
// Source: phase requirement + current day-key data model
export const getPreviousSetSuggestion = (
  days: Record<string, CalendarDay>,
  exerciseName: string,
): { weight: number; reps: number } | null => {
  // latest-day-first traversal; return last non-empty set
  return null;
};
```

### Anti-Patterns to Avoid
- **Hand-rolled storage writes in every action:** Дублирует логику и ломает atomicity. [VERIFIED: codebase review]  
- **Inline anonymous handlers everywhere в JSX:** ухудшает читаемость и нарушает проектные правила. [VERIFIED: user rules]  
- **Бизнес-логика подсказки (LOG-04) в компоненте:** усложняет тестирование и повторное использование. [VERIFIED: user rules]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persist/rehydration | Ручные `JSON.parse`/`setItem` в каждом action | `persist` middleware + единый safe adapter | Меньше дублирования, прозрачная rehydrate-модель. [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md] |
| Form validation | ad-hoc `if` проверки в `onChange` | RHF + zod schema | Строгие контракты данных и меньше JSX-шума. [CITED: https://react-hook-form.com/get-started] [CITED: https://zod.dev/basics] |
| Storage error handling | Игнорирование quota/security ошибок | try/catch + UI error state | Браузер бросает исключения (`QuotaExceededError`, `SecurityError`). [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] |

**Key insight:** Для Phase 1 критичнее надежность write/read контура, чем добавление новых сложных хранилищ. [VERIFIED: roadmap + requirements]

## Common Pitfalls

### Pitfall 1: Потеря данных при записи в localStorage
**What goes wrong:** запись silently fails или выбрасывает исключение, а UI показывает "успешно". [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria]  
**Why it happens:** нет try/catch и нет error-state в текущем write path. [VERIFIED: codebase review]  
**How to avoid:** safe adapter + возврат результата записи + UI copy из UI-SPEC для ошибки. [VERIFIED: UI-SPEC]  
**Warning signs:** после reload часть логов не видна. [VERIFIED: requirements logic]

### Pitfall 2: LOG-04 реализован частично (копирование только последнего сета текущего упражнения)
**What goes wrong:** пользователь не получает "предыдущий сет" при повторном логировании из истории. [VERIFIED: codebase review]  
**Why it happens:** сейчас `addSetToExercise` берет `lastSet` только из текущего `exercise.sets`. [VERIFIED: codebase review]  
**How to avoid:** selector по историческим дням + явный label `Предыдущий: ...`. [VERIFIED: UI-SPEC]  
**Warning signs:** label отсутствует, подсказка всегда пустая на новом упражнении. [VERIFIED: codebase review]

### Pitfall 3: Низкая проверяемость критериев без тестов
**What goes wrong:** регрессии в edit/delete/add не ловятся до ручной проверки. [VERIFIED: package.json + glob scan]  
**Why it happens:** отсутствуют test runner, test files и test scripts. [VERIFIED: package.json + glob scan]  
**How to avoid:** Wave 0 для Vitest + RTL + requirement-to-test mapping. [CITED: https://vitest.dev/guide/] [CITED: https://testing-library.com/docs/react-testing-library/intro/]  
**Warning signs:** изменения проходят lint/build, но ломают пользовательский сценарий. [ASSUMED]

## Code Examples

Verified patterns from official sources:

### Persist store with storage strategy
```typescript
// Source: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useQuickLogStore = create(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set({ entries: [...get().entries, entry] }),
    }),
    {
      name: "quick-log-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

### RHF + schema validation baseline
```typescript
// Source: https://react-hook-form.com/get-started + https://zod.dev/basics
import { useForm } from "react-hook-form";
import { z } from "zod";

const SetSchema = z.object({
  reps: z.number().int().min(1).max(999),
  weight: z.number().min(0).max(999),
});

type SetForm = z.infer<typeof SetSchema>;

export const useSetForm = () => useForm<SetForm>();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ручное хранение малых структур в localStorage | `persist` middleware + typed store actions | устойчиво в экосистеме Zustand v4/v5 | Меньше boilerplate и лучше rehydrate-поток. [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md] |
| Формы на локальном `useState` | RHF + schema validation | широко применяется в React forms | Легче держать UX быстрым и предсказуемым. [CITED: https://react-hook-form.com/get-started] [CITED: https://zod.dev/basics] |

**Deprecated/outdated:**
- Проверка данных только в UI-обработчиках без схемы — высокий риск рассинхрона логики. [CITED: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | В проекте будут использовать `npm` как основной PM для добавления новых зависимостей | Standard Stack | Низкий: можно заменить на `pnpm add` без изменения архитектуры |
| A2 | Для UX "1-2 действия" допустим drawer+inline edit без отдельного экрана | Summary | Средний: может потребоваться переработка interaction flow |

## Open Questions (RESOLVED)

1. **[RESOLVED] Нужно ли в рамках Phase 1 мигрировать `days` на IndexedDB?**
   - What we know: `localStorage` уже используется и покрывает DATA-01 базово. [VERIFIED: codebase review]
   - What's unclear: целевой объем данных в v1 и риск упора в лимиты.
   - Resolution: для Phase 1 миграция на IndexedDB не требуется; фиксируем `localStorage` + safe adapter, IndexedDB переносится в отдельную deferred-фазу hardening при появлении количественного требования объема. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria]

2. **[RESOLVED] Нужна ли отдельная сущность workout-session в Phase 1?**
   - What we know: текущая модель `day -> exercises -> sets` уже существует. [VERIFIED: codebase review]
   - What's unclear: будут ли сценарии "черновик сессии" до финального сохранения.
   - Resolution: отдельная сущность workout-session в рамках Phase 1 не вводится; остается текущая модель `day -> exercises -> sets` до появления явного требования в `ROADMAP/REQUIREMENTS`. [VERIFIED: roadmap + requirements]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test tooling | ✓ | v22.22.0 | — |
| npm | dependency install/scripts | ✓ | 10.9.4 | pnpm |
| pnpm | optional package manager | ✓ | 10.32.1 | npm |

**Missing dependencies with no fallback:**
- None identified. [VERIFIED: environment audit]

**Missing dependencies with fallback:**
- None identified. [VERIFIED: environment audit]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + React Testing Library 16.3.2 (planned for Wave 0) |
| Config file | none — see Wave 0 |
| Quick run command | `npx vitest run src/features/quickLog/model/__tests__/quickLogStore.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOG-01 | Create set (weight/reps) in 1-2 actions | integration | `npx vitest run src/features/quickLog/ui/__tests__/quickLogFlow.test.tsx` | ❌ Wave 0 |
| LOG-02 | Append multiple sets | unit | `npx vitest run src/entities/calendarDay/model/__tests__/addSetToExercise.test.ts` | ❌ Wave 0 |
| LOG-03 | Edit/delete any set pre-finish | unit | `npx vitest run src/entities/calendarDay/model/__tests__/setCrud.test.ts` | ❌ Wave 0 |
| LOG-04 | Previous set suggestion shown | unit | `npx vitest run src/entities/calendarDay/model/__tests__/previousSetSelector.test.ts` | ❌ Wave 0 |
| DATA-01 | Data persists after reload/rehydrate | integration | `npx vitest run src/entities/calendarDay/model/__tests__/persistence.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run lint` + targeted `npx vitest run <file>`  
- **Per wave merge:** `npx vitest run`  
- **Phase gate:** full suite green + smoke manual сценарий reload browser

### Wave 0 Gaps
- [ ] `vitest.config.ts` — тестовый раннер и environment (`jsdom`)  
- [ ] `src/test/setup.ts` — shared setup/mocks for storage and crypto  
- [ ] `src/**/*.test.ts(x)` files listed in requirements map  
- [ ] Install framework: `npm install -D vitest @testing-library/react @testing-library/dom`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Out of scope for Phase 1 (local-only, no auth) |
| V3 Session Management | no | Out of scope for Phase 1 (no server session) |
| V4 Access Control | no | Out of scope for single-user local workflow |
| V5 Input Validation | yes | Zod schema + server-equivalent strict validation in store boundary |
| V6 Cryptography | no | Нет крипто-требования в LOG/DATA-01 |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed numeric input (reps/weight) | Tampering | Allowlist validation (`zod`), min/max constraints, reject invalid payloads. [CITED: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html] |
| XSS via unsafe render/path values | Tampering | Не использовать `dangerouslySetInnerHTML`, не пропускать непроверенные URL/HTML; опираться на React safe defaults. [CITED: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html] |
| Local data corruption / quota overflow | Denial of Service | try/catch around storage writes, graceful error UI, optional eviction/retry policy. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria] |

## Sources

### Primary (HIGH confidence)
- Project docs: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/phases/01-quick-logging-core-local-persistence/01-UI-SPEC.md` [VERIFIED: local files]  
- Codebase files: `src/entities/calendarDay/slice/calendarStore.ts`, `src/shared/lib/storage.ts`, `src/features/exercise/ui/ExerciseBody.tsx`, `src/widgets/exerciseList/ui/ExerciseList.tsx`, `package.json` [VERIFIED: codebase review]  
- npm registry checks (`npm view`) for `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `vitest`, `@testing-library/react` [VERIFIED: npm registry]  
- Zustand README (persist middleware) [CITED: https://raw.githubusercontent.com/pmndrs/zustand/main/README.md]  
- MDN localStorage [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage]  
- MDN storage quotas/eviction [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria]

### Secondary (MEDIUM confidence)
- React Hook Form get started [CITED: https://react-hook-form.com/get-started]  
- Zod basics [CITED: https://zod.dev/basics]  
- Vitest getting started [CITED: https://vitest.dev/guide/]  
- React Testing Library intro [CITED: https://testing-library.com/docs/react-testing-library/intro/]

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - основано на текущем коде + npm registry + официальных docs.
- Architecture: HIGH - подтверждено реальной структурой слоев и текущими store/actions.
- Pitfalls: MEDIUM - часть рисков подтверждена docs, часть зависит от будущих объемов данных.

**Research date:** 2026-04-14  
**Valid until:** 2026-05-14

