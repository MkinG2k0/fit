### Task 4: `ShareCard` UI

**Files:**
- Create: `src/features/shareStats/ui/ShareCard.tsx`

**Interfaces:**
- Consumes: `ShareModel`, `formatTonnageParts`
- Produces: `ShareCard` with `forwardRef` or `ref` on the root 9:16 node for capture

- [ ] **Step 1: Implement card shell**

Root:

```tsx
<div
  ref={ref}
  className="flex h-[1920px] w-[1080px] flex-col bg-background p-16 text-foreground"
>
  <p className="text-4xl font-extrabold tracking-tight">Fit</p>
  {/* scope body */}
</div>
```

- `kind === "empty"` → centered muted message.
- `exercise` → title, category, period/range, max weight from→to, tonnage, session count, simple SVG polyline sparkline from `sparkline` values (no recharts — keep capture reliable).
- `workout` → date, list of exercises + setsSummary, totals.
- `period` → KPIs + top 3 list.

Use design tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary` as needed).

Props:

```ts
interface ShareCardProps {
  model: ShareModel;
  className?: string;
}
```

Export `ShareCard` with `React.forwardRef<HTMLDivElement, ShareCardProps>`.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/shareStats/ui/ShareCard.tsx
git commit -m "$(cat <<'EOF'
feat(shareStats): add 9:16 ShareCard layouts

EOF
)"
```

---

