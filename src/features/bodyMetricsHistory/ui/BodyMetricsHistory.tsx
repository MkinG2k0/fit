import { PencilLine, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import {
  formatBodyMetricsRecordedAt,
  type BodyMetricDefinition,
  type BodyMetricsEntry,
} from "@/entities/bodyMetrics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

interface BodyMetricsHistoryProps {
  entries: BodyMetricsEntry[];
  metricDefinitions: BodyMetricDefinition[];
  activeEntryId: string | null;
  className?: string;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
}

const HISTORY_LIST_CLASS = "grid gap-2";
const ENTRY_CARD_CLASS = "grid gap-2 rounded-lg border border-border p-3";
const ENTRY_HEAD_CLASS = "flex items-center justify-between gap-2";
const ENTRY_MEASUREMENTS_CLASS = "grid gap-1 text-sm text-muted-foreground";
const ENTRY_ACTIONS_CLASS = "flex items-center gap-1";

const formatMetricValue = (definition: BodyMetricDefinition, value: number) => {
  return `${definition.label}: ${value.toFixed(1)} ${definition.unit}`;
};

export const BodyMetricsHistory = ({
  entries,
  metricDefinitions,
  activeEntryId,
  className,
  onEdit,
  onDelete,
}: BodyMetricsHistoryProps) => {
  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    const { entryId } = event.currentTarget.dataset;
    if (!entryId) {
      return;
    }
    onEdit(entryId);
  };

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    const { entryId } = event.currentTarget.dataset;
    if (!entryId) {
      return;
    }
    onDelete(entryId);
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle>История замеров</CardTitle>
        <CardDescription>
          Сравнивайте изменения по датам и редактируйте неточные значения
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет записей. Добавьте первый замер, чтобы увидеть историю.
          </p>
        ) : (
          <div className={HISTORY_LIST_CLASS}>
            {entries.map((entry) => (
              <article
                key={entry.id}
                className={cn(
                  ENTRY_CARD_CLASS,
                  entry.id === activeEntryId && "border-primary/60 bg-primary/5",
                )}
              >
                <div className={ENTRY_HEAD_CLASS}>
                  <p className="text-sm font-medium">
                    {formatBodyMetricsRecordedAt(entry.recordedAt)}
                  </p>
                  <div className={ENTRY_ACTIONS_CLASS}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      data-entry-id={entry.id}
                      onClick={handleEditClick}
                    >
                      <PencilLine />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      data-entry-id={entry.id}
                      onClick={handleDeleteClick}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className={ENTRY_MEASUREMENTS_CLASS}>
                  {metricDefinitions.map((definition) => {
                    const value = entry.measurements[definition.key];
                    if (typeof value !== "number") {
                      return null;
                    }
                    return (
                      <p key={definition.key}>
                        {formatMetricValue(definition, value)}
                      </p>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
