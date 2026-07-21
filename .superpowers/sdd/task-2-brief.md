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
    "РўС‹ РїРѕРјРѕРіР°РµС€СЊ РЅР°СЃС‚СЂРѕРёС‚СЊ С†РµР»Рё РґРЅРµРІРЅС‹С… РєРѕР»РµС† РїСЂРѕРіСЂРµСЃСЃР° РІ РїСЂРёР»РѕР¶РµРЅРёРё СѓС‡С‘С‚Р° С‚СЂРµРЅРёСЂРѕРІРѕРє.",
    "fullSetCount вЂ” С‡РёСЃР»Рѕ РїРѕРґС…РѕРґРѕРІ РґР»СЏ 100% РІРЅРµС€РЅРµРіРѕ РєРѕР»СЊС†Р° Р·Р° РґРµРЅСЊ.",
    "fullVolume вЂ” РѕР±СЉС‘Рј (СЃСѓРјРјР° РІРµСЃГ—РїРѕРІС‚РѕСЂС‹ СЃ РїСЂР°РІРёР»РѕРј bodyweight) РґР»СЏ 100% РІРЅСѓС‚СЂРµРЅРЅРµРіРѕ РєРѕР»СЊС†Р°.",
    "Р¦РµР»СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ С‡СѓС‚СЊ РІС‹С€Рµ С‚РёРїРёС‡РЅРѕРіРѕ С‚СЂРµРЅРёСЂРѕРІРѕС‡РЅРѕРіРѕ РґРЅСЏ РїРѕ СЃРІРѕРґРєРµ (Р»С‘РіРєРёР№ РІС‹Р·РѕРІ): РІС‹С€Рµ РјРµРґРёР°РЅС‹, РЅРѕ РѕР±С‹С‡РЅРѕ РЅРёР¶Рµ Р»СѓС‡С€РµРіРѕ РґРЅСЏ; РѕСЂРёРµРЅС‚РёСЂ РѕРєРѕР»Рѕ p75 РґРѕРїСѓСЃС‚РёРј.",
    "РћС‚РІРµС‚СЊ РўРћР›Р¬РљРћ РІР°Р»РёРґРЅС‹Рј JSON Р±РµР· markdown Рё Р±РµР· РїРѕСЏСЃРЅРµРЅРёР№:",
    '{"fullSetCount": <С†РµР»РѕРµ >= 1>, "fullVolume": <С†РµР»РѕРµ >= 1>}',
  ].join(" ");

export const buildRingGoalsUserPrompt = (
  summary: RingGoalsHistorySummary,
): string => {
  const lines = [
    "РЎРІРѕРґРєР° С‚СЂРµРЅРёСЂРѕРІРѕС‡РЅС‹С… РґРЅРµР№ Р·Р° РїРѕСЃР»РµРґРЅРёРµ 90 РєР°Р»РµРЅРґР°СЂРЅС‹С… РґРЅРµР№:",
    `trainingDays: ${summary.trainingDays}`,
    `sets mean/median/p75/best: ${summary.meanSetCount} / ${summary.medianSetCount} / ${summary.p75SetCount} / ${summary.bestSetCount}`,
    `volume mean/median/p75/best: ${summary.meanVolume} / ${summary.medianVolume} / ${summary.p75Volume} / ${summary.bestVolume}`,
    "Р•СЃР»Рё trainingDays = 0, РїСЂРµРґР»РѕР¶Рё СЂР°Р·СѓРјРЅС‹Рµ СЃС‚Р°СЂС‚РѕРІС‹Рµ С†РµР»Рё РґР»СЏ РЅРѕРІРёС‡РєР° (Р±Р»РёР·РєРѕ Рє 20 РїРѕРґС…РѕРґРѕРІ Рё 6000 РѕР±СЉС‘РјР°, РјРѕР¶РЅРѕ С‡СѓС‚СЊ СЃРєРѕСЂСЂРµРєС‚РёСЂРѕРІР°С‚СЊ).",
    "Р’РµСЂРЅРё JSON СЃ fullSetCount Рё fullVolume.",
  ];
  return lines.join("\n");
};
```

- [ ] **Step 2: Implement parser**

Mirror extract strategy from `src/features/aiRecommendations/lib/parseAiFillSets.ts` (direct JSON в†’ fence в†’ object slice), then validate:

```ts
import {
  MIN_RING_GOAL_VALUE,
  type RingGoalsSettings,
} from "@/entities/user";

const EXTRACT_ERROR =
  "РќРµ СѓРґР°Р»РѕСЃСЊ СЂР°Р·РѕР±СЂР°С‚СЊ РѕС‚РІРµС‚ РР. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.";

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
- `'{"fullSetCount":24,"fullVolume":7200}'` в†’ `{ fullSetCount: 24, fullVolume: 7200 }`
- `'```json\n{"fullSetCount":10,"fullVolume":100}\n```'` в†’ ok
- `'{"fullSetCount":0,"fullVolume":100}'` в†’ throws
- `'not json'` в†’ throws

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: clean for new files.

- [ ] **Step 5: Commit**

```bash
git add src/features/profileRingGoalsSettings/lib/buildRingGoalsAiPrompts.ts src/features/profileRingGoalsSettings/lib/parseRingGoalsAiResponse.ts
git commit -m "feat: add ring goals AI prompts and response parser"
```

---

