---
id: 260811-ttt-time-input-mask-space-separated-mm-ss
slug: time-input-mask-space-separated-mm-ss
status: in-progress
created: 2026-08-11
---

# PLAN: Маска ввода времени (мм сс)

## Goal

Упростить ввод длительности в подходах с типом «время»: принимать `1 55` как 1 мин 55 сек и `11 55` как 11 мин 55 сек, плюс прежний формат `мм:сс`. Пока печатают — маска (только цифры и один разделитель, секунды ≤ 2 цифр).

## Tasks

1. Расширить `parseMmSsToSeconds` (пробел/`:`), добавить `sanitizeTimeDraft` в `measurementTypes.ts`, экспорт
2. Подключить маску в `ExerciseSetRow` (onChange + placeholder)
