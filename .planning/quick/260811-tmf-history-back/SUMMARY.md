---
id: 260811-tmf-history-back
slug: history-back
status: complete
created: 2026-08-11
completed: 2026-08-11
---

# SUMMARY: Единая навигация «назад»

## What changed

- Добавлен `resolveBackPath` + `useNavigateBack` — карта parent-routes вместо `history.back()`.
- Header «←» ведёт на родителя: create/edit/preset → `/exercises`, список → `/`.
- Android back использует ту же карту; на корне — `App.minimizeApp()`.
- Cancel/локальные onBack уже были на `/exercises` / `/load-table` — согласованы с картой.

## Hierarchy

```
/ (корень)
├── /exercises
│   ├── /exercises/create|edit|bulk-create
│   └── /presets/create|edit
├── /load-table
│   └── /load-table/:id
└── /timer, /analytics, /news, /settings, …
```

## Files

- `src/shared/lib/navigation/*`
- `src/widgets/header/ui/Header.tsx`
- `src/app/providers/AndroidBackNavigation.tsx`
- `src/shared/lib/index.ts`
