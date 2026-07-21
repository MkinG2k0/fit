# AI Ring Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add «ИИ цель» on calendar ring goals settings — derive `fullSetCount` / `fullVolume` from ~90 days of local history via ChatGPT gateway and save immediately.

**Architecture:** Pure helpers in `profileRingGoalsSettings/lib` build a compact 90-day aggregate summary, prompt the existing `createChatCompletion` gateway, parse strict JSON, then `setRingGoals`. UI button on `ProfileRingGoalsSettingsCard` owns loading/error/success. History is loaded with `readAllTrainingDaysFromStorage` (full journal), not only in-memory calendar month.

**Tech Stack:** React 19, Zustand `useUserStore`, dayjs, `createChatCompletion` (`src/shared/api/aiGateway.ts`), `calcSetVolumeKg`, Tailwind/shadcn Button.

## Global Constraints

- Package manager: `pnpm` only (never npm/npx).
- History window: `RING_GOALS_AI_HISTORY_DAYS = 90` (today inclusive → today − 89 days).
- Ambition: slightly above typical training day (prompt guidance).
- Apply mode: on success call `setRingGoals` immediately (no separate Save).
- Sparse/empty history: still call the gateway; invalid parse → error, do not mutate goals.
- Prompt payload: compact aggregates only (not full workout log text).
- Response JSON: `{ "fullSetCount": number, "fullVolume": number }` — safe integers `>= MIN_RING_GOAL_VALUE` (1).
- No new routes; no vitest in repo — verify with `pnpm exec tsc --noEmit -p tsconfig.app.json` + manual smoke.
- Styling: Tailwind tokens; className literals inline (no CSS modules, no class-string consts).
- Spec source: `docs/superpowers/specs/2026-07-21-ai-ring-goals-design.md`.

---

## File Structure

| Path | Role |
| --- | --- |
| `src/features/profileRingGoalsSettings/lib/ringGoalsAiConstants.ts` | `RING_GOALS_AI_HISTORY_DAYS = 90` |
| `src/features/profileRingGoalsSettings/lib/buildRingGoalsHistorySummary.ts` | Window filter + aggregates |
| `src/features/profileRingGoalsSettings/lib/buildRingGoalsAiPrompts.ts` | system/user prompt strings |
| `src/features/profileRingGoalsSettings/lib/parseRingGoalsAiResponse.ts` | JSON extract + validate |
| `src/features/profileRingGoalsSettings/lib/suggestRingGoalsFromHistory.ts` | Orchestration |
| `src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx` | Button + wire-up |
| `src/features/profileRingGoalsSettings/index.ts` | Keep exporting card only (helpers stay internal) |

---

### Task 1: History summary builder

**Files:**
- Create: `src/features/profileRingGoalsSettings/lib/ringGoalsAiConstants.ts`
- Create: `src/features/profileRingGoalsSettings/lib/buildRingGoalsHistorySummary.ts`

**Interfaces:**
- Consumes: `CalendarDay` from `@/entities/calendarDay`, `calcSetVolumeKg` from `@/shared/lib/calcSetVolumeKg`, dayjs + `customParseFormat`
- Produces:
  - `export const RING_GOALS_AI_HISTORY_DAYS = 90`
  - `export interface RingGoalsHistorySummary { trainingDays: number; meanSetCount: number; medianSetCount: number; p75SetCount: number; bestSetCount: number; meanVolume: number; medianVolume: number; p75Volume: number; bestVolume: number; }`
  - `export const buildRingGoalsHistorySummary = (days: Record<string, CalendarDay>, now?: dayjs.Dayjs) => RingGoalsHistorySummary`

- [ ] **Step 1: Add constants file**

```ts
/** Календарное окно истории для ИИ-цели колец (включая сегодня). */
export const RING_GOALS_AI_HISTORY_DAYS = 90;
```

- [ ] **Step 2: Implement summary builder**

```ts
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { CalendarDay } from "@/entities/calendarDay";
import { calcSetVolumeKg } from "@/shared/lib/calcSetVolumeKg";
import { RING_GOALS_AI_HISTORY_DAYS } from "./ringGoalsAiConstants";

dayjs.extend(customParseFormat);

const DAY_KEY_FORMAT = "DD-MM-YYYY";

export interface RingGoalsHistorySummary {
  trainingDays: number;
  meanSetCount: number;
  medianSetCount: number;
  p75SetCount: number;
  bestSetCount: number;
  meanVolume: number;
  medianVolume: number;
  p75Volume: number;
  bestVolume: number;
}

interface DayTotals {
  setCount: number;
  volume: number;
}

const isLoggedSet = (weight: number, reps: number) =>
  reps > 0 || weight > 0;

const getDayTotals = (day: CalendarDay): DayTotals | null => {
  let setCount = 0;
  let volume = 0;
  for (const exercise of day.exercises) {
    for (const set of exercise.sets) {
      if (!isLoggedSet(set.weight, set.reps)) {
        continue;
      }
      setCount += 1;
      volume += calcSetVolumeKg(set.weight, set.reps);
    }
  }
  if (setCount === 0 && volume === 0) {
    return null;
  }
  return { setCount, volume };
};

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((acc, value) => acc + value, 0) / values.length;

/** Inclusive percentile on sorted ascending copy (nearest-rank). */
const percentile = (sortedAsc: number[], p: number) => {
  if (sortedAsc.length === 0) {
    return 0;
  }
  const rank = Math.ceil((p / 100) * sortedAsc.length) - 1;
  const index = Math.min(sortedAsc.length - 1, Math.max(0, rank));
  return sortedAsc[index] ?? 0;
};

const median = (sortedAsc: number[]) => {
  if (sortedAsc.length === 0) {
    return 0;
  }
  const mid = Math.floor(sortedAsc.length / 2);
  if (sortedAsc.length % 2 === 0) {
    return ((sortedAsc[mid - 1] ?? 0) + (sortedAsc[mid] ?? 0)) / 2;
  }
  return sortedAsc[mid] ?? 0;
};

export const buildRingGoalsHistorySummary = (
  days: Record<string, CalendarDay>,
  now: Dayjs = dayjs(),
): RingGoalsHistorySummary => {
  const end = now.startOf("day");
  const start = end.subtract(RING_GOALS_AI_HISTORY_DAYS - 1, "day");

  const totals: DayTotals[] = [];
  for (const [dateKey, day] of Object.entries(days)) {
    const parsed = dayjs(dateKey, DAY_KEY_FORMAT, true);
    if (!parsed.isValid()) {
      continue;
    }
    const dayStart = parsed.startOf("day");
    if (dayStart.isBefore(start) || dayStart.isAfter(end)) {
      continue;
    }
    const dayTotals = getDayTotals(day);
    if (dayTotals) {
      totals.push(dayTotals);
    }
  }

  const setCounts = totals.map((item) => item.setCount).sort((a, b) => a - b);
  const volumes = totals.map((item) => item.volume).sort((a, b) => a - b);

  return {
    trainingDays: totals.length,
    meanSetCount: average(setCounts),
    medianSetCount: median(setCounts),
    p75SetCount: percentile(setCounts, 75),
    bestSetCount: setCounts.length ? (setCounts[setCounts.length - 1] ?? 0) : 0,
    meanVolume: average(volumes),
    medianVolume: median(volumes),
    p75Volume: percentile(volumes, 75),
    bestVolume: volumes.length ? (volumes[volumes.length - 1] ?? 0) : 0,
  };
};
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: exit 0 (or only pre-existing unrelated errors — new files must be clean).

- [ ] **Step 4: Commit**

```bash
git add src/features/profileRingGoalsSettings/lib/ringGoalsAiConstants.ts src/features/profileRingGoalsSettings/lib/buildRingGoalsHistorySummary.ts
git commit -m "feat: add ring goals AI history summary"
```

---

### Task 2: Prompts + JSON parser

**Files:**
- Create: `src/features/profileRingGoalsSettings/lib/buildRingGoalsAiPrompts.ts`
- Create: `src/features/profileRingGoalsSettings/lib/parseRingGoalsAiResponse.ts`

**Interfaces:**
- Consumes: `RingGoalsHistorySummary`, `MIN_RING_GOAL_VALUE` / `RingGoalsSettings` from `@/entities/user`
- Produces:
  - `getRingGoalsSystemPrompt(): string`
  - `buildRingGoalsUserPrompt(summary: RingGoalsHistorySummary): string`
  - `parseRingGoalsAiResponse(raw: string): RingGoalsSettings` (throws `Error` with Russian message)

- [ ] **Step 1: Implement prompts**

```ts
import type { RingGoalsHistorySummary } from "./buildRingGoalsHistorySummary";

export const getRingGoalsSystemPrompt = (): string =>
  [
    "Ты помогаешь настроить цели дневных колец прогресса в приложении учёта тренировок.",
    "fullSetCount — число подходов для 100% внешнего кольца за день.",
    "fullVolume — объём (сумма вес×повторы с правилом bodyweight) для 100% внутреннего кольца.",
    "Цель должна быть чуть выше типичного тренировочного дня по сводке (лёгкий вызов): выше медианы, но обычно ниже лучшего дня; ориентир около p75 допустим.",
    "Ответь ТОЛЬКО валидным JSON без markdown и без пояснений:",
    '{"fullSetCount": <целое >= 1>, "fullVolume": <целое >= 1>}',
  ].join(" ");

export const buildRingGoalsUserPrompt = (
  summary: RingGoalsHistorySummary,
): string => {
  const lines = [
    "Сводка тренировочных дней за последние 90 календарных дней:",
    `trainingDays: ${summary.trainingDays}`,
    `sets mean/median/p75/best: ${summary.meanSetCount} / ${summary.medianSetCount} / ${summary.p75SetCount} / ${summary.bestSetCount}`,
    `volume mean/median/p75/best: ${summary.meanVolume} / ${summary.medianVolume} / ${summary.p75Volume} / ${summary.bestVolume}`,
    "Если trainingDays = 0, предложи разумные стартовые цели для новичка (близко к 20 подходов и 6000 объёма, можно чуть скорректировать).",
    "Верни JSON с fullSetCount и fullVolume.",
  ];
  return lines.join("\n");
};
```

- [ ] **Step 2: Implement parser**

Mirror extract strategy from `src/features/aiRecommendations/lib/parseAiFillSets.ts` (direct JSON → fence → object slice), then validate:

```ts
import {
  MIN_RING_GOAL_VALUE,
  type RingGoalsSettings,
} from "@/entities/user";

const EXTRACT_ERROR =
  "Не удалось разобрать ответ ИИ. Попробуйте ещё раз.";

const extractJsonPayload = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(EXTRACT_ERROR);
  }

  const tryParse = (text: string): unknown | null => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  if (direct !== null) {
    return direct;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    const fenced = tryParse(fenceMatch[1].trim());
    if (fenced !== null) {
      return fenced;
    }
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    const objectSlice = tryParse(trimmed.slice(objectStart, objectEnd + 1));
    if (objectSlice !== null) {
      return objectSlice;
    }
  }

  throw new Error(EXTRACT_ERROR);
};

const parseGoalInteger = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    if (Number.isSafeInteger(rounded) && rounded >= MIN_RING_GOAL_VALUE) {
      return rounded;
    }
    return null;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    if (Number.isSafeInteger(parsed) && parsed >= MIN_RING_GOAL_VALUE) {
      return parsed;
    }
  }
  return null;
};

export const parseRingGoalsAiResponse = (raw: string): RingGoalsSettings => {
  const payload = extractJsonPayload(raw);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(EXTRACT_ERROR);
  }
  const record = payload as { fullSetCount?: unknown; fullVolume?: unknown };
  const fullSetCount = parseGoalInteger(record.fullSetCount);
  const fullVolume = parseGoalInteger(record.fullVolume);
  if (fullSetCount === null || fullVolume === null) {
    throw new Error(EXTRACT_ERROR);
  }
  return { fullSetCount, fullVolume };
};
```

- [ ] **Step 3: Sanity-check parser mentally / in console**

Expected mappings:
- `'{"fullSetCount":24,"fullVolume":7200}'` → `{ fullSetCount: 24, fullVolume: 7200 }`
- `'```json\n{"fullSetCount":10,"fullVolume":100}\n```'` → ok
- `'{"fullSetCount":0,"fullVolume":100}'` → throws
- `'not json'` → throws

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: clean for new files.

- [ ] **Step 5: Commit**

```bash
git add src/features/profileRingGoalsSettings/lib/buildRingGoalsAiPrompts.ts src/features/profileRingGoalsSettings/lib/parseRingGoalsAiResponse.ts
git commit -m "feat: add ring goals AI prompts and response parser"
```

---

### Task 3: Orchestration helper

**Files:**
- Create: `src/features/profileRingGoalsSettings/lib/suggestRingGoalsFromHistory.ts`

**Interfaces:**
- Consumes: `createChatCompletion` from `@/shared/api`, summary/prompts/parser helpers, `CalendarDay`, `RingGoalsSettings`
- Produces: `export const suggestRingGoalsFromHistory = async (days: Record<string, CalendarDay>) => Promise<RingGoalsSettings>`

- [ ] **Step 1: Implement orchestrator**

```ts
import type { CalendarDay } from "@/entities/calendarDay";
import type { RingGoalsSettings } from "@/entities/user";
import { createChatCompletion } from "@/shared/api";
import { buildRingGoalsHistorySummary } from "./buildRingGoalsHistorySummary";
import {
  buildRingGoalsUserPrompt,
  getRingGoalsSystemPrompt,
} from "./buildRingGoalsAiPrompts";
import { parseRingGoalsAiResponse } from "./parseRingGoalsAiResponse";

export const suggestRingGoalsFromHistory = async (
  days: Record<string, CalendarDay>,
): Promise<RingGoalsSettings> => {
  const summary = buildRingGoalsHistorySummary(days);
  const response = await createChatCompletion([
    { role: "system", content: getRingGoalsSystemPrompt() },
    { role: "user", content: buildRingGoalsUserPrompt(summary) },
  ]);

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Шлюз вернул пустой ответ. Попробуйте ещё раз.");
  }

  return parseRingGoalsAiResponse(content);
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: exit 0 for new code.

- [ ] **Step 3: Commit**

```bash
git add src/features/profileRingGoalsSettings/lib/suggestRingGoalsFromHistory.ts
git commit -m "feat: orchestrate AI ring goal suggestion from history"
```

---

### Task 4: Wire UI button on settings card

**Files:**
- Modify: `src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx`

**Interfaces:**
- Consumes: `suggestRingGoalsFromHistory`, `readAllTrainingDaysFromStorage` from `@/shared/lib/analyticsStorage`, `AiGatewayError` from `@/shared/api`, existing `setRingGoals`
- Produces: button «ИИ цель» with loading/success/error UX per spec

- [ ] **Step 1: Extend component state and handler**

Add imports:

```ts
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Target } from "lucide-react";
import {
  DEFAULT_RING_GOALS,
  MIN_RING_GOAL_VALUE,
  useUserStore,
} from "@/entities/user";
import { AiGatewayError } from "@/shared/api";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { cn } from "@/shared/lib/classMerge";
// ...existing UI imports...
import { suggestRingGoalsFromHistory } from "../lib/suggestRingGoalsFromHistory";
```

Inside component, add:

```ts
const [isSuggesting, setIsSuggesting] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
```

Keep existing `validationMessage` for manual save validation; reuse it for AI errors OR add `aiMessage` destructive — prefer single `feedback` pattern:

- `validationMessage` for errors (manual + AI)
- `successMessage` for AI success (clear on new actions)

Handler:

```ts
const handleSuggestAiRingGoals = async () => {
  if (isSuggesting) {
    return;
  }
  setIsSuggesting(true);
  setValidationMessage("");
  setSuccessMessage("");
  try {
    const days = await readAllTrainingDaysFromStorage();
    const goals = await suggestRingGoalsFromHistory(days);
    setRingGoals(goals);
    setSuccessMessage("Цель сохранена по истории за 3 месяца");
  } catch (err) {
    if (err instanceof AiGatewayError) {
      setValidationMessage(err.message);
    } else if (err instanceof Error && err.message.trim()) {
      setValidationMessage(err.message);
    } else {
      setValidationMessage(
        "Не удалось получить ИИ-цель. Попробуйте позже.",
      );
    }
  } finally {
    setIsSuggesting(false);
  }
};
```

Clear `successMessage` in `handleSaveRingGoals` and `handleResetRingGoals` as well.

- [ ] **Step 2: Add button + messages in JSX**

In the button row (`flex flex-wrap gap-2`), after Reset, add:

```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => {
    void handleSuggestAiRingGoals();
  }}
  disabled={isSuggesting}
>
  {isSuggesting ? "Считаем…" : "ИИ цель"}
</Button>
```

Below buttons:

```tsx
{successMessage ? (
  <p className="mt-2 text-sm text-muted-foreground">{successMessage}</p>
) : null}
{validationMessage ? (
  <p className="mt-2 text-sm text-destructive">{validationMessage}</p>
) : null}
```

(Keep existing validationMessage block — do not duplicate.)

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: clean.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `pnpm dev`  
Checklist:
1. Settings → Цели колец → «ИИ цель» shows «Считаем…» and disables itself.
2. With gateway up + journal data → goals update in inputs and persist after reload.
3. With gateway down → destructive error; previous goals unchanged.
4. Manual Save / Reset still work; Reset clears AI success text.

- [ ] **Step 5: Commit**

```bash
git add src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx
git commit -m "feat: add AI ring goal button to settings card"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Gateway computation | 3 |
| Immediate `setRingGoals` | 4 |
| Slightly above typical | 2 (system prompt) |
| Sparse history still calls AI | 2–3 (no early empty return) |
| Compact aggregates / 90 days | 1 |
| Parse JSON + validate | 2 |
| UI button / loading / messages | 4 |
| `readAllTrainingDaysFromStorage` for full history | 4 |
| No new route | — (none added) |

**Placeholder scan:** none.  
**Type consistency:** `RingGoalsHistorySummary` / `RingGoalsSettings` / `suggestRingGoalsFromHistory` names aligned across tasks.
