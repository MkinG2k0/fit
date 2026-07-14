export type AiRecommendationPeriod =
  | "last_workout"
  | "week"
  | "month"
  | "all";

export type AiRecommendationKind =
  | "next_session"
  | "progression"
  | "technique"
  | "recovery"
  | "custom";

export const AI_RECOMMENDATION_PERIODS: {
  value: AiRecommendationPeriod;
  label: string;
}[] = [
  { value: "last_workout", label: "На последнюю тренировку" },
  { value: "week", label: "На неделю" },
  { value: "month", label: "На месяц" },
  { value: "all", label: "На весь период" },
];

export const AI_RECOMMENDATION_KINDS: {
  value: AiRecommendationKind;
  label: string;
}[] = [
  { value: "next_session", label: "Следующая тренировка" },
  { value: "progression", label: "Прогресс весов и повторов" },
  { value: "technique", label: "Техника" },
  { value: "recovery", label: "Восстановление и частота" },
  { value: "custom", label: "Свой запрос" },
];

export const getPeriodLabel = (period: AiRecommendationPeriod): string => {
  return (
    AI_RECOMMENDATION_PERIODS.find((item) => item.value === period)?.label ??
    period
  );
};

export const getKindLabel = (kind: AiRecommendationKind): string => {
  return (
    AI_RECOMMENDATION_KINDS.find((item) => item.value === kind)?.label ?? kind
  );
};
