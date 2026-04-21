import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ExerciseTrendRow } from "@/entities/analytics";
import { AnalyticsCard, AnalyticsSectionTitle } from "@/shared/ui/analytics";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { AnalyticsExerciseDetailsDialog } from "./AnalyticsExerciseDetailsDialog";
import { AnalyticsExerciseSparkline } from "./AnalyticsExerciseSparkline";

interface AnalyticsExerciseListCardProps {
  rows: ExerciseTrendRow[];
}

const INITIAL_ROWS_COUNT = 5;
const EXERCISE_QUERY_PARAM = "analytics-exercise";

export const AnalyticsExerciseListCard = ({
  rows,
}: AnalyticsExerciseListCardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedSearch) {
      return rows;
    }
    return rows.filter((row) =>
      row.name.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch, rows]);
  const visibleRows = isExpanded
    ? filteredRows
    : filteredRows.slice(0, INITIAL_ROWS_COUNT);
  const shouldShowToggleButton = filteredRows.length > INITIAL_ROWS_COUNT;
  const selectedExerciseId = searchParams.get(EXERCISE_QUERY_PARAM);
  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedExerciseId) ?? null,
    [rows, selectedExerciseId],
  );

  useEffect(() => {
    if (!selectedExerciseId || selectedRow) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(EXERCISE_QUERY_PARAM);
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, selectedExerciseId, selectedRow, setSearchParams]);

  const handleRowClick = (row: ExerciseTrendRow) => {
    if (selectedExerciseId === row.id) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(EXERCISE_QUERY_PARAM, row.id);
    setSearchParams(nextSearchParams);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open || !selectedExerciseId) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(EXERCISE_QUERY_PARAM);
    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <AnalyticsCard className="min-h-[484.13px]">
      <AnalyticsSectionTitle subtitle="Лидеры по тоннажу за период">
        По упражнениям
      </AnalyticsSectionTitle>
      <Input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Поиск упражнения"
        className="mb-2"
      />
      <div className="grid gap-2 flex-1">
        {visibleRows.length === 0 ? (
          <div className="rounded-lg  border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
            Упражнения не найдены
          </div>
        ) : (
          visibleRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => handleRowClick(row)}
              className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <div className="flex flex-col min-w-0">
                <div className="truncate text-left text-sm font-semibold text-foreground">
                  {row.name}
                </div>
                <div className="text-xs text-left not-only:text-muted-foreground">
                  {row.sessions} тренировок
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <AnalyticsExerciseSparkline
                  trendPoints={row.trend}
                  className="h-8 w-12 shrink-0 sm:w-16"
                />
                <p className="text-lg font-bold text-primary">
                  {(row.tonnage / 1000).toFixed(1)}
                  <span className="text-sm">т</span>
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      {shouldShowToggleButton && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-3 w-full rounded-md border border-border bg-card/60 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-card"
        >
          {isExpanded ? "Скрыть" : "Еще"}
        </button>
      )}
      <AnalyticsExerciseDetailsDialog
        row={selectedRow}
        open={Boolean(selectedRow)}
        onOpenChange={handleDialogOpenChange}
      />
    </AnalyticsCard>
  );
};
