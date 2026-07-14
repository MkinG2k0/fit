import {
  AI_RECOMMENDATION_KINDS,
  type AiRecommendationKind,
} from "../model/types";

const KIND_FOCUS_DIRECTIVES: Record<AiRecommendationKind, string> = {
  next_session:
    "Сфокусируйся на плане ближайшей сессии: какие упражнения, рабочие веса и повторы предложить.",
  progression:
    "Сфокусируйся на прогрессе рабочих весов и повторов: где рост, где плато и что делать дальше.",
  technique:
    "Сфокусируйся на технике и типичных ошибках новичков по упражнениям из журнала.",
  recovery:
    "Сфокусируйся на восстановлении и частоте тренировок: отдых между сессиями, признаки перегрузки.",
  custom:
    "Опирайся на раздел «Свой запрос» пользователя; журнал используй только как контекст.",
};

const getFocusDirectiveByKindLabel = (kindLabel: string): string => {
  const kind = AI_RECOMMENDATION_KINDS.find(
    (item) => item.label === kindLabel,
  )?.value;
  if (kind) {
    return KIND_FOCUS_DIRECTIVES[kind];
  }
  return "Дай полезные практические рекомендации по журналу.";
};

export const getSystemPrompt = (): string => {
  return [
    "Ты — тренер по силовым тренировкам. Отвечай по фактам, без подбадриваний, комплиментов и лишней воды.",
    "Вход: журнал (даты, упражнения, вес, повторы). Сравнивай числа, отмечай рост, стагнацию и провалы.",
    "Выход: конкретные действия — целевой вес/повторы, объём, частота, типичные ошибки техники.",
    "Только русский язык. Короткие формулировки, цифры вместо общих советов.",
    "Не ставь диагнозов, не лечи травмы, не давай медицинских назначений.",
    "Мало данных — прямо скажи, чего не хватает, и дай минимально разумный следующий шаг без домыслов.",
    "Формат: markdown (заголовки и списки). Без эмодзи и маркетингового тона.",
  ].join(" ");
};

export const buildUserPrompt = (
  periodLabel: string,
  kindLabel: string,
  workoutLogText: string,
  customQuery?: string,
): string => {
  const lines = [
    `Период: ${periodLabel}.`,
    `Тип запроса: ${kindLabel}.`,
    getFocusDirectiveByKindLabel(kindLabel),
    "",
    "Ниже журнал тренировок (дата, упражнение, вес × повторы).",
    "Ответ оформи структурировано в markdown (заголовки и списки).",
    "",
    "Журнал:",
    workoutLogText,
  ];

  const trimmedQuery = customQuery?.trim();
  if (trimmedQuery) {
    lines.push("", "Уточнение / свой запрос пользователя:", trimmedQuery);
  }

  return lines.join("\n");
};
