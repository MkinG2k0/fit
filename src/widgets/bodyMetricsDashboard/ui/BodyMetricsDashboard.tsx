import { useMemo, useState } from "react";
import {
  BODY_METRIC_DEFINITIONS,
  selectBodyMetricsTrendSummary,
  selectSortedBodyMetricsEntries,
  useBodyMetricsStore,
  type BodyMetricDefinition,
  type BodyMetricsDraft,
} from "@/entities/bodyMetrics";
import {
  BodyMetricsForm,
  CreateCustomMetricCard,
} from "@/features/bodyMetricsEntry";
import { BodyMetricsHistory } from "@/features/bodyMetricsHistory";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";
import { BodyMetricsSummaryCards } from "./BodyMetricsSummaryCards";
import { BodyMetricsTrendChart } from "./BodyMetricsTrendChart";

interface BodyMetricsDashboardProps {
  className?: string;
}

export const BodyMetricsDashboard = ({ className }: BodyMetricsDashboardProps) => {
  const entries = useBodyMetricsStore((state) => state.entries);
  const customMetricDefinitions = useBodyMetricsStore(
    (state) => state.customMetricDefinitions,
  );
  const isHydrated = useBodyMetricsStore((state) => state.isHydrated);
  const status = useBodyMetricsStore((state) => state.status);
  const errorMessage = useBodyMetricsStore((state) => state.errorMessage);
  const addEntry = useBodyMetricsStore((state) => state.addEntry);
  const updateEntry = useBodyMetricsStore((state) => state.updateEntry);
  const deleteEntry = useBodyMetricsStore((state) => state.deleteEntry);
  const addCustomMetricDefinition = useBodyMetricsStore(
    (state) => state.addCustomMetricDefinition,
  );
  const clearError = useBodyMetricsStore((state) => state.clearError);

  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const metricDefinitions = useMemo<BodyMetricDefinition[]>(() => {
    return [...BODY_METRIC_DEFINITIONS, ...customMetricDefinitions];
  }, [customMetricDefinitions]);

  const sortedEntries = useMemo(() => selectSortedBodyMetricsEntries(entries), [entries]);
  const trendSummary = useMemo(
    () => selectBodyMetricsTrendSummary(sortedEntries, metricDefinitions),
    [sortedEntries, metricDefinitions],
  );
  const activeEntry = useMemo(
    () => sortedEntries.find((entry) => entry.id === activeEntryId) ?? null,
    [activeEntryId, sortedEntries],
  );

  const handleFormSubmit = (draft: BodyMetricsDraft, entryId: string | null) => {
    if (entryId) {
      updateEntry(entryId, draft);
      setActiveEntryId(null);
      return;
    }

    addEntry(draft);
    setActiveEntryId(null);
  };

  const handleEditEntry = (entryId: string) => {
    setActiveEntryId(entryId);
    clearError();
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId);
    if (entryId === activeEntryId) {
      setActiveEntryId(null);
    }
  };

  const handleCancelEdit = () => {
    setActiveEntryId(null);
    clearError();
  };

  const handleCreateCustomMetric = (payload: { label: string; unit: string }) => {
    addCustomMetricDefinition(payload);
  };

  if (!isHydrated || status === "loading") {
    return (
      <Card className={cn("gap-3 py-4", className)}>
        <CardHeader className="px-4">
          <CardTitle>Загрузка замеров</CardTitle>
          <CardDescription>Подготавливаем ваши записи параметров тела</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className={cn("grid gap-3 sm:gap-4", className)}>
      <BodyMetricsSummaryCards summary={trendSummary} />
      <BodyMetricsTrendChart
        entries={sortedEntries}
        metricDefinitions={metricDefinitions}
      />

      <BodyMetricsForm
        key={activeEntry?.id ?? "new-entry"}
        initialEntry={activeEntry}
        metricDefinitions={metricDefinitions}
        onSubmit={handleFormSubmit}
        onCancelEdit={handleCancelEdit}
      />
      <CreateCustomMetricCard onCreateCustomMetric={handleCreateCustomMetric} />

      {status === "error" && errorMessage && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <BodyMetricsHistory
        entries={sortedEntries}
        metricDefinitions={metricDefinitions}
        activeEntryId={activeEntryId}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
    </section>
  );
};
