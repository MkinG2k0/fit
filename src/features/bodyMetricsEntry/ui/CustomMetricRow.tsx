import { PencilLine, Save, Trash2, X } from "lucide-react";
import { type ChangeEvent } from "react";
import type { BodyMetricDefinition } from "@/entities/bodyMetrics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";

interface CustomMetricRowProps {
  definition: BodyMetricDefinition;
  isEditing: boolean;
  draftLabel: string;
  draftUnit: string;
  onStartEdit: (definition: BodyMetricDefinition) => void;
  onCancelEdit: () => void;
  onDraftLabelChange: (value: string) => void;
  onDraftUnitChange: (value: string) => void;
  onSave: (metricKey: string) => void;
  onDelete: (metricKey: string) => void;
}

export const CustomMetricRow = ({
  definition,
  isEditing,
  draftLabel,
  draftUnit,
  onStartEdit,
  onCancelEdit,
  onDraftLabelChange,
  onDraftUnitChange,
  onSave,
  onDelete,
}: CustomMetricRowProps) => {
  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    onDraftLabelChange(event.target.value);
  };

  const handleUnitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onDraftUnitChange(event.target.value);
  };

  const handleStartEditClick = () => onStartEdit(definition);
  const handleSaveClick = () => onSave(definition.key);
  const handleDeleteClick = () => onDelete(definition.key);

  return (
    <article className="grid gap-2 rounded-lg border border-border p-3">
      {isEditing ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={draftLabel} onChange={handleLabelChange} placeholder="Название" />
          <Input value={draftUnit} onChange={handleUnitChange} placeholder="Ед. изм." />
        </div>
      ) : (
        <div className="grid gap-1">
          <p className="text-sm font-medium">{definition.label}</p>
          <p className="text-xs text-muted-foreground">Ед. измерения: {definition.unit}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button type="button" size="sm" onClick={handleSaveClick}>
              <Save />
              Сохранить
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onCancelEdit}>
              <X />
              Отмена
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={handleStartEditClick}>
            <PencilLine />
            Изменить
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={handleDeleteClick}>
          <Trash2 />
          Удалить
        </Button>
      </div>
    </article>
  );
};
