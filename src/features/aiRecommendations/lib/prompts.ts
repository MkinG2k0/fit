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
    "Ты — опытный, доброжелательный тренер для новичков в тренажёрном зале.",
    "Анализируй журнал тренировок пользователя (даты, упражнения, вес и повторы).",
    "Давай практические рекомендации: прогрессивная перегрузка, техника выполнения,",
    "выбор рабочих весов и повторов на следующую сессию, восстановление и частота.",
    "Пиши по-русски, коротко и по делу, с конкретными числами где это уместно.",
    "Не ставь медицинских диагнозов, не лечи травмы и не давай медицинских назначений.",
    "Если данных мало — честно скажи об этом и предложи осторожный следующий шаг.",
    "Структурируй ответ в markdown: заголовки и списки, чтобы его было удобно читать.",
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
