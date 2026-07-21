import type { RingGoalsHistorySummary } from "./buildRingGoalsHistorySummary";

export const getRingGoalsSystemPrompt = (): string =>
  [
    "Ты помогаешь настроить цели дневных колец прогресса в приложении учёта тренировок.",
    "fullSetCount — число подходов для 100% внешнего кольца за день.",
    "fullVolume — объём (сумма вес×повторы с правилом bodyweight) для 100% внутреннего кольца.",
    "Цель должна быть чуть выше типичного тренировочного дня по сводке (лёгкий вызов): выше медианы, но обычно ниже лучшего дня; ориентир около p75 допустим.",
    "Отвечать ТОЛЬКО валидным JSON без markdown и без пояснений:",
    '{"fullSetCount": <целое >= 1>, "fullVolume": <целое >= 1>}',
  ].join(" ");

export const buildRingGoalsUserPrompt = (
  summary: RingGoalsHistorySummary,
): string => {
  const lines = [
    "Сводка тренировочных дней за последние 90 календарных дней:",
    `trainingDays: ${summary.trainingDays}`,
    `sets mean/median/p75/best: ${summary.meanSetCount} / ${summary.medianSetCount} / ${summary.p75SetCount} / ${summary.bestSetCount}`,
    `volume mean/median/p75/best: ${summary.meanVolume} / ${summary.medianVolume} / ${summary.p75Volume} / ${summary.bestVolume}`,
    "Если trainingDays = 0, предложи разумные стартовые цели для новичка (близко к 20 подходов и 6000 объёма, можно чуть скорректировать).",
    "Верни JSON с fullSetCount и fullVolume.",
  ];
  return lines.join("\n");
};
