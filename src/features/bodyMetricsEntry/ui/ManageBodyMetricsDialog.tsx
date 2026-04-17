import { Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import type { BodyMetricDefinition } from "@/entities/bodyMetrics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { CustomMetricRow } from "./CustomMetricRow";

interface ManageBodyMetricsDialogProps {
  customMetricDefinitions: BodyMetricDefinition[];
  onAdd: (payload: { label: string; unit: string }) => void;
  onUpdate: (metricKey: string, payload: { label: string; unit: string }) => void;
  onDelete: (metricKey: string) => void;
}

export const ManageBodyMetricsDialog = ({
  customMetricDefinitions,
  onAdd,
  onUpdate,
  onDelete,
}: ManageBodyMetricsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUnit, setNewUnit] = useState("см");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftUnit, setDraftUnit] = useState("");

  const handleAddClick = () => {
    onAdd({ label: newLabel, unit: newUnit });
    setNewLabel("");
    setNewUnit("см");
  };

  const handleStartEdit = (definition: BodyMetricDefinition) => {
    setEditingKey(definition.key);
    setDraftLabel(definition.label);
    setDraftUnit(definition.unit);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setDraftLabel("");
    setDraftUnit("");
  };

  const handleSaveEdit = (metricKey: string) => {
    onUpdate(metricKey, { label: draftLabel, unit: draftUnit });
    handleCancelEdit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          <Settings2 />
          Управление параметрами
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление параметрами</DialogTitle>
          <DialogDescription>
            Добавляйте, изменяйте и удаляйте пользовательские параметры тела.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-3 rounded-lg border border-border p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="new-custom-metric-label">Название параметра</Label>
              <Input
                id="new-custom-metric-label"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="Например: Предплечье"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-custom-metric-unit">Ед. измерения</Label>
              <Input
                id="new-custom-metric-unit"
                value={newUnit}
                onChange={(event) => setNewUnit(event.target.value)}
                placeholder="см"
              />
            </div>
          </div>
          <Button type="button" onClick={handleAddClick}>
            <Plus />
            Добавить параметр
          </Button>
        </section>

        <section className="grid max-h-[45vh] gap-2 overflow-y-auto">
          {customMetricDefinitions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пользовательских параметров пока нет.
            </p>
          ) : (
            customMetricDefinitions.map((definition) => (
              <CustomMetricRow
                key={definition.key}
                definition={definition}
                isEditing={editingKey === definition.key}
                draftLabel={draftLabel}
                draftUnit={draftUnit}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onDraftLabelChange={setDraftLabel}
                onDraftUnitChange={setDraftUnit}
                onSave={handleSaveEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};
