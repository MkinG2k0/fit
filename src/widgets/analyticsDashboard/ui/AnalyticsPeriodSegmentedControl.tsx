import type { AnalyticsPeriod } from "@/entities/analytics";
import { cn } from "@/shared/ui/lib/utils";

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "7d", label: "7д" },
  { value: "30d", label: "30д" },
  { value: "90d", label: "90д" },
  { value: "365d", label: "1г" },
];

interface AnalyticsPeriodSegmentedControlProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export const AnalyticsPeriodSegmentedControl = ({
  value,
  onChange,
}: AnalyticsPeriodSegmentedControlProps) => {
  return (
    <div className="inline-flex w-full rounded-full border border-border bg-muted/60 p-1 sm:w-auto">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors sm:flex-none sm:px-4",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
