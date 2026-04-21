import type { AnalyticsPeriod, PeriodComparison } from "@/entities/analytics";
import { formatTonnage } from "@/shared/lib";

const PERIOD_LABEL: Record<AnalyticsPeriod, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  "365d": "1 год",
};

const formatDeltaSign = (value: number) => {
  if (value > 0) {
    return "+";
  }
  return "";
};

export const getPeriodLabel = (period: AnalyticsPeriod) => PERIOD_LABEL[period];

export const formatPeriodDelta = (comparison: PeriodComparison) => {
  const absDelta = Math.abs(comparison.delta);
  const signedDelta = `${formatDeltaSign(comparison.delta)}${formatTonnage(absDelta)}`;
  const percent =
    comparison.deltaPercent === null
      ? "новый период"
      : `${formatDeltaSign(comparison.deltaPercent)}${comparison.deltaPercent.toFixed(1)}%`;

  return {
    signedDelta,
    percent,
  };
};

