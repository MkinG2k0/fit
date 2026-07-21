### Task 4: Wire UI button on settings card

**Files:**
- Modify: `src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx`

**Interfaces:**
- Consumes: `suggestRingGoalsFromHistory`, `readAllTrainingDaysFromStorage` from `@/shared/lib/analyticsStorage`, `AiGatewayError` from `@/shared/api`, existing `setRingGoals`
- Produces: button В«РР С†РµР»СЊВ» with loading/success/error UX per spec

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

Keep existing `validationMessage` for manual save validation; reuse it for AI errors OR add `aiMessage` destructive вЂ” prefer single `feedback` pattern:

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
    setSuccessMessage("Р¦РµР»СЊ СЃРѕС…СЂР°РЅРµРЅР° РїРѕ РёСЃС‚РѕСЂРёРё Р·Р° 3 РјРµСЃСЏС†Р°");
  } catch (err) {
    if (err instanceof AiGatewayError) {
      setValidationMessage(err.message);
    } else if (err instanceof Error && err.message.trim()) {
      setValidationMessage(err.message);
    } else {
      setValidationMessage(
        "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РР-С†РµР»СЊ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.",
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
  {isSuggesting ? "РЎС‡РёС‚Р°РµРјвЂ¦" : "РР С†РµР»СЊ"}
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

(Keep existing validationMessage block вЂ” do not duplicate.)

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: clean.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `pnpm dev`  
Checklist:
1. Settings в†’ Р¦РµР»Рё РєРѕР»РµС† в†’ В«РР С†РµР»СЊВ» shows В«РЎС‡РёС‚Р°РµРјвЂ¦В» and disables itself.
2. With gateway up + journal data в†’ goals update in inputs and persist after reload.
3. With gateway down в†’ destructive error; previous goals unchanged.
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
| Sparse history still calls AI | 2вЂ“3 (no early empty return) |
| Compact aggregates / 90 days | 1 |
| Parse JSON + validate | 2 |
| UI button / loading / messages | 4 |
| `readAllTrainingDaysFromStorage` for full history | 4 |
| No new route | вЂ” (none added) |

**Placeholder scan:** none.  
**Type consistency:** `RingGoalsHistorySummary` / `RingGoalsSettings` / `suggestRingGoalsFromHistory` names aligned across tasks.
