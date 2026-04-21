import type { ExerciseTrendRow } from "@/entities/analytics";
import type { SVGProps } from "react";

interface AnalyticsExerciseSparklineProps extends SVGProps<SVGSVGElement> {
  trendPoints: ExerciseTrendRow["trend"];
}

const buildPolylinePoints = (points: ExerciseTrendRow["trend"]) => {
  if (points.length === 0) {
    return "";
  }
  const values = points.map((point) => point.tonnage);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
};

export const AnalyticsExerciseSparkline = ({
  trendPoints,
  className,
  ...props
}: AnalyticsExerciseSparklineProps) => {
  const polylinePoints = buildPolylinePoints(trendPoints);

  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none" {...props}>
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polylinePoints}
      />
    </svg>
  );
};
