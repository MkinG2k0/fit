import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import type { AppSettingsBundle } from "@/shared/lib/appSettingsTransfer";
import type { AppSettingsSectionDefinition } from "../model/types";
import { ImportSectionRow } from "./ImportSectionRow";

const BUNDLE_DATE_DISPLAY_LENGTH = 10;

interface ImportSettingsDialogProps {
  open: boolean;
  bundle: AppSettingsBundle | null;
  importableDefinitions: AppSettingsSectionDefinition[];
  selectedSectionIds: ReadonlySet<string>;
  unknownSectionKeys: string[];
  onOpenChange: (open: boolean) => void;
  onToggleSection: (sectionId: string, checked: boolean) => void;
  onConfirm: () => void;
}

export const ImportSettingsDialog = ({
  open,
  bundle,
  importableDefinitions,
  selectedSectionIds,
  unknownSectionKeys,
  onOpenChange,
  onToggleSection,
  onConfirm,
}: ImportSettingsDialogProps) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Импорт настроек</DialogTitle>
          <DialogDescription>
            Выберите разделы, которые нужно заменить данными из файла
            {bundle
              ? ` от ${bundle.exportedAt.slice(0, BUNDLE_DATE_DISPLAY_LENGTH)}`
              : ""}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-1">
          {importableDefinitions.map((definition) => (
            <ImportSectionRow
              key={definition.id}
              definition={definition}
              checked={selectedSectionIds.has(definition.id)}
              onToggleSection={onToggleSection}
            />
          ))}
        </div>
        {unknownSectionKeys.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            В файле есть неизвестные разделы ({unknownSectionKeys.join(", ")}). Они
            будут проигнорированы текущей версией приложения.
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="button" onClick={onConfirm}>
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
