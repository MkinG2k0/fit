import { AI_FILL_HISTORY_MONTHS } from "../model/aiFillConstants";

export const getAiFillSystemPrompt = (): string => {
  return [
    "Ты — тренер по силовым тренировкам. Отвечай строго по фактам из журнала, без подбадриваний и воды.",
    "Задача: предложить рабочие подходы (вес и повторы) на СЕГОДНЯШНЮЮ сессию для одного упражнения.",
    "Не ставь диагнозов, не лечи травмы, не давай медицинских назначений.",
    "Выход СТРОГО одним JSON-объектом без markdown, без пояснений и без текста вокруг:",
    '{"sets":[{"weight":number,"reps":number},...]}',
  ].join(" ");
};

export const buildAiFillUserPrompt = (
  exerciseName: string,
  workoutLogText: string,
  months: number = AI_FILL_HISTORY_MONTHS,
): string => {
  return [
    `Упражнение: ${exerciseName}.`,
    `История за последние ${months} мес. (только это упражнение):`,
    "",
    workoutLogText,
    "",
    "Предложи разумное число рабочих подходов на сегодня (обычно 3–5, по данным журнала).",
    "Не выдумывай другие упражнения. Вес и повторы — числа.",
    'Верни только JSON: {"sets":[{"weight":number,"reps":number},...]}.',
  ].join("\n");
};
