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
    throw new Error("РЁР»СЋР· РІРµСЂРЅСѓР» РїСѓСЃС‚РѕР№ РѕС‚РІРµС‚. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.");
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

