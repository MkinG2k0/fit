# Task 4 Report: ShareCard UI

## Status

**DONE_WITH_CONCERNS**

## Summary

Created the fixed 1080×1920 `ShareCard` capture UI with a forwarded root ref and layouts for every `ShareModel` kind.

## Changes

- Created `src/features/shareStats/ui/ShareCard.tsx`.
- Added branded `Fit` card shell using inline Tailwind design-token classes.
- Added centered empty-state rendering.
- Added exercise layout with category, period/range, max-weight change, tonnage, session count, and a dependency-free SVG polyline sparkline.
- Added workout layout with date, exercise/set rows, per-exercise tonnage, and workout totals.
- Added period layout with total tonnage, training days, streak, and top-three exercises.
- Used `formatTonnageParts` for all tonnage output.
- Kept Analytics wiring out of scope and did not modify `src/features/news/model/newsEntries.ts`.

## Verification

`pnpm exec eslint "src/features/shareStats/ui/ShareCard.tsx"`

- Exit code: 0
- Result: no ESLint errors or warnings.

`pnpm exec prettier --check "src/features/shareStats/ui/ShareCard.tsx"`

- Exit code: 0
- Result: file matches Prettier formatting.

`git diff --check -- "src/features/shareStats/ui/ShareCard.tsx"`

- Exit code: 0
- Result: no whitespace errors.

`pnpm exec tsc --noEmit -p tsconfig.app.json`

- Exit code: 2
- Result: only the four known pre-existing `TS2352` errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts` at lines 81, 82, 99, and 100.
- No TypeScript errors were reported under `src/features/shareStats`.

IDE diagnostics for `ShareCard.tsx` reported no linter errors.

## Commit

- SHA: `6e94446`
- Subject: `feat(shareStats): add 9:16 ShareCard layouts`
- Included only `src/features/shareStats/ui/ShareCard.tsx`.

## Concerns

- The repository-wide TypeScript check remains non-zero because of the unrelated pre-existing category-normalization errors.
- Visual PNG capture was not wired or exercised in Analytics because that integration belongs to Task 5.
