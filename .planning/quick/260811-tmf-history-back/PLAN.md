---
id: 260811-tmf-history-back
slug: history-back
status: in-progress
created: 2026-08-11
---

# PLAN: Единая навигация «назад»

## Goal

Убрать цикличные пути из `navigate(-1)` / `history.back()`. Кнопка «назад» и Android back всегда ведут на детерминированный родительский экран.

## Hierarchy

| Экран | Назад → |
|---|---|
| `/exercises/create`, `/exercises/edit`, `/exercises/bulk-create` | `/exercises` |
| `/presets/create`, `/presets/edit` | `/exercises` |
| `/load-table/:id` | `/load-table` |
| `/exercises`, `/load-table`, `/timer`, `/analytics`, … | `/` |
| `/`, `/onboarding` | нет (корень) |

## Tasks

1. Добавить `resolveBackPath` + `useNavigateBack` в `shared/lib`
2. Подключить в `Header` и `AndroidBackNavigation`
3. Проверить Cancel/локальные onBack на согласованность
