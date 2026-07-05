---
status: complete
---

# Quick Task 260705-w7t Summary

**Zero kg for bodyweight exercises in logging and volume stats**

## Done

- Added `calcSetVolumeKg(weight, reps)` — `reps × (weight > 0 ? weight : 1)`
- Wired into analytics tonnage, calendar ring volume, exercise card header, workout day summary
- UI: show `0` in weight/reps fields once either value is entered; `min={0}` on inputs

## Commits

- Code: (pending user commit request)

## Notes

- `maxWeight` KPI still reflects actual logged kg (0 for pull-ups) — only volume/tonnage uses effective multiplier
- Long-term alternative: exercise flag `bodyweight` or separate rep-based metric
