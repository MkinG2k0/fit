### Task 5: Sheet + Analytics entry point

**Files:**
- Create: `src/features/shareStats/ui/ShareStatsSheet.tsx`
- Create: `src/features/shareStats/ui/ShareStatsButton.tsx`
- Create: `src/features/shareStats/index.ts`
- Modify: `src/widgets/analyticsDashboard/ui/AnalyticsDashboard.tsx`
- Modify: `src/pages/AnalyticsPage/ui/AnalyticsPage.tsx` (pass `allTrainingDays` + open state if cleaner)

**Interfaces:**
- Consumes: builders, ShareCard, render/share helpers, Drawer from shadcn (`vaul`), Button
- Produces: exported `ShareStatsButton` / sheet wired on Analytics

- [ ] **Step 1: Sheet behavior**

`ShareStatsSheet` props:

```ts
interface ShareStatsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: Record<string, CalendarDay>;
  defaultPeriod: AnalyticsPeriod;
}
```

State: `scope`, `exerciseId`, `workoutDateKey`, `period`, `status: null | { variant: "error"; text: string }`, `isSharing`.

On open / days change: initialize `period = defaultPeriod`, first exercise option, first workout date key.

Preview: `buildShareModel(days, selection)` → scaled-down wrapper:

```tsx
<div className="mx-auto max-h-[50vh] overflow-auto">
  <div className="origin-top scale-[0.28]">
    <ShareCard ref={cardRef} model={model} />
  </div>
</div>
```

Keep a second offscreen absolute `ShareCard` at full size (`pointer-events-none fixed left-[-10000px] top-0`) for capture — or capture the scaled one only if `html-to-image` quality is acceptable; **prefer offscreen full-size node** for crisp PNG.

Share button disabled when `model.kind === "empty"` or `isSharing`.

On share click:

```ts
try {
  const node = cardRef.current;
  if (!node) throw new Error("Карточка не готова.");
  const blob = await renderShareCardToPng(node);
  const result = await sharePngFile(`fit-share-${Date.now()}.png`, blob);
  if (result === "native-cancelled") return;
} catch (error) {
  setStatus({
    variant: "error",
    text: error instanceof Error ? error.message : "Не удалось поделиться.",
  });
}
```

UI controls: segmented scope; period segmented when scope is exercise or period; select/list for exercise and workout date.

- [ ] **Step 2: Button + barrel**

```ts
// ShareStatsButton.tsx — Button with Share2 icon, opens sheet
// index.ts
export { ShareStatsButton } from "./ui/ShareStatsButton";
export { ShareStatsSheet } from "./ui/ShareStatsSheet";
```

`ShareStatsButton` can own open state and accept `days` + `defaultPeriod`.

- [ ] **Step 3: Wire Analytics**

In `AnalyticsDashboard` (or page header above dashboard): render

```tsx
<ShareStatsButton days={days} defaultPeriod={period} />
```

Extend props:

```ts
interface AnalyticsDashboardProps {
  // existing...
  days: Record<string, CalendarDay>;
}
```

Pass `allTrainingDays` from `AnalyticsPage`.

Place the button near the hero / period control (top of dashboard section) so it’s visible even when trends exist. If empty analytics state, still show share (sheet can empty-state).

- [ ] **Step 4: Typecheck + smoke**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

Manual smoke:
1. Analytics → Поделиться → Период 30д → preview KPIs → share/download PNG.
2. Scope Упражнение with data → weight from→to visible.
3. Scope Тренировка → day list → PNG.
4. Empty history → disabled share + «Недостаточно данных».
5. (Native if available) cancel share → no error banner.

- [ ] **Step 5: Commit**

```bash
git add src/features/shareStats src/widgets/analyticsDashboard src/pages/AnalyticsPage
git commit -m "$(cat <<'EOF'
feat(shareStats): wire share sheet on Analytics

EOF
)"
```

---

