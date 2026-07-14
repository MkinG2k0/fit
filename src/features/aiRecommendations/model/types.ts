export type AiRecommendationPeriod =
  | "last_workout"
  | "week"
  | "month"
  | "all";

export const AI_RECOMMENDATION_PERIODS: {
  value: AiRecommendationPeriod;
  label: string;
}[] = [
  { value: "last_workout", label: "На последнюю тренировку" },
  { value: "week", label: "На неделю" },
  { value: "month", label: "На месяц" },
  { value: "all", label: "На весь период" },
];

export const getPeriodLabel = (period: AiRecommendationPeriod): string => {
  return (
    AI_RECOMMENDATION_PERIODS.find((item) => item.value === period)?.label ??
    period
  );
};
