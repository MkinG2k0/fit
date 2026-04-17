import { useMemo, useState } from "react";
import {
  BODY_METRIC_DEFINITIONS,
  formatBodyMetricsRecordedAt,
  selectBodyMetricsTrendSummary,
  selectSortedBodyMetricsEntries,
  useBodyMetricsStore,
  type BodyMetricDefinition,
  type BodyMetricsDraft,
} from "@/entities/bodyMetrics";
import {
  BodyMetricsForm,
  ManageBodyMetricsDialog,
} from "@/features/bodyMetricsEntry";
import { BodyMetricsHistory } from "@/features/bodyMetricsHistory";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
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
  const updateCustomMetricDefinition = useBodyMetricsStore(
    (state) => state.updateCustomMetricDefinition,
  );
  const deleteCustomMetricDefinition = useBodyMetricsStore(
    (state) => state.deleteCustomMetricDefinition,
  );
  const clearError = useBodyMetricsStore((state) => state.clearError);

  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteConfirmEntryId, setDeleteConfirmEntryId] = useState<string | null>(null);
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
  const entryPendingDelete = useMemo(
    () => sortedEntries.find((entry) => entry.id === deleteConfirmEntryId) ?? null,
    [deleteConfirmEntryId, sortedEntries],
  );

  const handleFormSubmit = (draft: BodyMetricsDraft, entryId: string | null) => {
    if (entryId) {
      updateEntry(entryId, draft);
      setActiveEntryId(null);
      return;
    }

    addEntry(draft);
    setIsCreateDialogOpen(false);
    setActiveEntryId(null);
  };

  const handleEditEntry = (entryId: string) => {
    setActiveEntryId(entryId);
    clearError();
  };

  const handleRequestDeleteEntry = (entryId: string) => {
    setDeleteConfirmEntryId(entryId);
  };

  const handleDeleteConfirmDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmEntryId(null);
    }
  };

  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmEntryId(null);
  };

  const handleConfirmDeleteEntry = () => {
    if (!deleteConfirmEntryId) {
      return;
    }
    deleteEntry(deleteConfirmEntryId);
    if (deleteConfirmEntryId === activeEntryId) {
      setActiveEntryId(null);
    }
    setDeleteConfirmEntryId(null);
  };

  const handleCancelEdit = () => {
    setActiveEntryId(null);
    clearError();
  };

  const handleCreateCustomMetric = (payload: { label: string; unit: string }) => {
    addCustomMetricDefinition(payload);
  };
  const handleUpdateCustomMetric = (
    metricKey: string,
    payload: { label: string; unit: string },
  ) => {
    updateCustomMetricDefinition(metricKey, payload);
  };
  const handleDeleteCustomMetric = (metricKey: string) => {
    deleteCustomMetricDefinition(metricKey);
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

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => {
            clearError();
            setIsCreateDialogOpen(true);
          }}
        >
          Новые замеры
        </Button>
        <ManageBodyMetricsDialog
          customMetricDefinitions={customMetricDefinitions}
          onAdd={handleCreateCustomMetric}
          onUpdate={handleUpdateCustomMetric}
          onDelete={handleDeleteCustomMetric}
        />
      </div>

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
        onDelete={handleRequestDeleteEntry}
      />

      <Dialog
        open={deleteConfirmEntryId !== null}
        onOpenChange={handleDeleteConfirmDialogOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              {entryPendingDelete
                ? `Запись от ${formatBodyMetricsRecordedAt(entryPendingDelete.recordedAt)} будет удалена без возможности восстановления.`
                : "Выбранная запись будет удалена без возможности восстановления."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDeleteConfirmDialog}>
              Отмена
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDeleteEntry}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeEntryId !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit();
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>Редактирование замера</DialogTitle>
            <DialogDescription>
              Обновите дату и значения параметров выбранной записи.
            </DialogDescription>
          </DialogHeader>
          {activeEntry && (
            <BodyMetricsForm
              initialEntry={activeEntry}
              metricDefinitions={metricDefinitions}
              onSubmit={handleFormSubmit}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            clearError();
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl p-0" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>Новые замеры</DialogTitle>
            <DialogDescription>
              Добавьте новую запись замера параметра тела.
            </DialogDescription>
          </DialogHeader>
          <BodyMetricsForm
            initialEntry={null}
            metricDefinitions={metricDefinitions}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};
