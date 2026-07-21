# Share Stats — Design Spec

**Date:** 2026-07-21  
**Status:** Approved for planning  
**Scope:** Share workout statistics as a PNG image from Analytics via a single sheet (exercise, workout day, or period).

## Goal

Let a beginner export a clean, branded progress card (image) from the Analytics screen and send it through the OS share sheet (Telegram, Stories, Files, etc.) — without accounts, cloud links, or a social feed.

## Decisions

| Topic | Choice |
| --- | --- |
| Output | PNG image only (no text-share MVP) |
| Aspect | 9:16 vertical (~1080×1920 render) |
| Entry | Analytics page only — one «Поделиться» control |
| Scope picker | Sheet: exercise / workout (day) / period |
| Week meaning | Rolling 7 days (`7d`), same spirit as analytics filter |
| Periods | `7d`, `30d`, `90d`, `180d` (new), `365d` |
| Period anchor | End date = today (align with Analytics period filter) |
| Native share | Reuse `@capacitor/share` (+ temp file), mirror settings-export pattern |
| Web share | `navigator.share({ files })` with download-PNG fallback |
| Backend | None — local data only |
| Out of MVP | Entry points on StatisticCard / day list; text digest; share URLs |

## User flow

1. User opens Analytics.
2. Taps **Поделиться**.
3. Sheet opens:
   - Scope: `Упражнение` | `Тренировка` | `Период`
   - Refinement:
     - Exercise → pick exercise **and** period (`7д…1г`; default = current Analytics filter)
     - Workout → pick a training day that has sessions (no period control)
     - Period → `7д / 30д / 90д / 180д / 1г` (default = current Analytics period filter)
   - Live preview of the card
4. If model has insufficient data → preview shows empty state; **Поделиться** disabled.
5. On confirm → render offscreen card → PNG → native/web share.
6. User cancels OS share → silent no-op. Render/share failure → short toast.

## Architecture

```
AnalyticsPage / AnalyticsDashboard
  → ShareStatsButton
  → ShareStatsSheet
        → buildShareModel(scope, selection, allTrainingDays)
        → ShareCard (offscreen / preview)
        → renderShareCardToPng(node)
        → sharePngFile(blob)   // Capacitor Share | Web Share | download
```

Feature module: `src/features/shareStats/` (UI + lib).  
Reuse: `readAllTrainingDaysFromStorage`, `buildDashboardAnalytics` / period selection helpers, existing tonnage/format helpers, `@capacitor/share` pattern from `downloadTextFile`.

No new routes. No changes to auth or sync.

## Modules (planned)

| Path | Responsibility |
| --- | --- |
| `features/shareStats/model/types.ts` | `ShareScope`, period union (incl. `180d`), selection, `ShareModel` |
| `features/shareStats/lib/buildShareModel.ts` | Aggregate local days → card view-model per scope |
| `features/shareStats/lib/renderShareCardToPng.ts` | DOM node → PNG Blob (`html-to-image` or equivalent) |
| `features/shareStats/lib/sharePngFile.ts` | Native temp file + Share; web files share / download |
| `features/shareStats/ui/ShareStatsSheet.tsx` | Scope + refinement + preview + confirm |
| `features/shareStats/ui/ShareCard.tsx` | Single 9:16 layout shell; content by scope |
| `features/shareStats/ui/ShareStatsButton.tsx` | Trigger on Analytics |
| `entities/analytics` (small) | Extend shared `AnalyticsPeriod` with `180d` once; Analytics segmented control and Share period picker both use it |

## Card content

**Chrome (all scopes):** Fit brand, scope title, date range label. No floating badges/stickers on the card.

### Exercise

- Name (+ category if available)
- Selected period label + date range
- Max weight: first session in window → last session in window when ≥2 sessions with weight; else single max in window
- Tonnage for period
- Mini sparkline of per-session max weight (or tonnage if weights are flat/zero)
- Session count in window

### Workout (day)

- Date
- Exercise list with short set summary (e.g. `3×8 @ 60` or `3 sets`)
- Day totals: tonnage, exercise count
- No charts

### Period (`7d` / `30d` / `90d` / `180d` / `365d`)

- Period label + date range
- KPIs: training days, total tonnage, current streak (if already computed by analytics; else omit streak)
- Top 3 exercises by tonnage in window
- No activity heatmap/strip in MVP (keep card quiet)

### Empty

- Message: недостаточно данных
- Share action disabled

## Data rules

- **Training day:** same definition as analytics / rings (day with meaningful sets).
- **`7d`:** rolling last 7 calendar days ending today (inclusive), not Mon–Sun calendar week.
- **Exercise pick list:** exercises that appear in loaded training history (optionally constrained to current analytics window for shorter lists).
- **Workout pick list:** dates with at least one training session.
- Metrics formulas must match Analytics / `calcSetVolumeKg` / existing formatters so shared numbers do not disagree with on-screen charts.

## Errors & edge cases

| Case | Behavior |
| --- | --- |
| No / sparse data | Empty preview; Share disabled |
| User cancels share sheet | No toast, no error |
| PNG render fails | Toast; stay in sheet |
| Share API unavailable (web) | Download PNG fallback |
| Native write/share fails | Toast with short message |

## Visual constraints

- One composition per card; token-first Tailwind / theme vars (no hardcoded one-off palette).
- Prefer existing analytics visual language (typography, muted/foreground, primary accents).
- Avoid dashboard clutter on the PNG: one headline job per card type.

## Success criteria

- From Analytics, user can share PNG for exercise, workout day, and each supported period.
- Native (Capacitor) opens system share with the image; web shares or downloads PNG.
- Numbers on the card match Analytics aggregates for the same window.
- Cancel and empty-data paths do not crash or leave orphan toasts.

## Non-goals (explicit)

- Social feed, likes, public profile links
- Server-hosted share URLs
- Text-only share as primary path
- Share buttons on ExerciseCard / StatisticCard / calendar day (later)
- Calendar-week (Mon–Sun) semantics for «неделя»
