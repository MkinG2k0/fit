import type { AnalyticsPeriod, PeriodComparison } from "@/entities/analytics";

const PERIOD_LABEL: Record<AnalyticsPeriod, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
};

const formatDeltaSign = (value: number) => {
  if (value > 0) {
    return "+";
  }
  return "";
};

export const getPeriodLabel = (period: AnalyticsPeriod) => PERIOD_LABEL[period];

export const formatPeriodDelta = (comparison: PeriodComparison) => {
  const signedDelta = `${formatDeltaSign(comparison.delta)}${comparison.delta.toFixed(0)}`;
  const percent =
    comparison.deltaPercent === null
      ? "новый период"
      : `${formatDeltaSign(comparison.deltaPercent)}${comparison.deltaPercent.toFixed(1)}%`;

  return {
    signedDelta,
    percent,
  };
};

