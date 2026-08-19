import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";

interface ExportSettingsDialogProps {
  open: boolean;
  includeMedia: boolean;
  onOpenChange: (open: boolean) => void;
  onIncludeMediaChange: (checked: boolean) => void;
  onConfirm: () => void;
}

export const ExportSettingsDialog = ({
  open,
  includeMedia,
  onOpenChange,
  onIncludeMediaChange,
  onConfirm,
}: ExportSettingsDialogProps) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Экспорт настроек</DialogTitle>
          <DialogDescription>
            Будут сохранены тема, каталог упражнений и пресеты, журнал тренировок
            и профиль без токена входа.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
          <Checkbox
            id="export-settings-include-media"
            checked={includeMedia}
            onCheckedChange={(value) => {
              if (value === "indeterminate") {
                return;
              }
              onIncludeMediaChange(value);
            }}
            className="mt-0.5"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label
              htmlFor="export-settings-include-media"
              className="text-sm font-medium leading-tight"
            >
              Медиа
            </Label>
            <p className="text-xs text-muted-foreground">
              Фото упражнений из каталога. Без галочки в файл не попадут
              изображения — файл будет меньше.
            </p>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button type="button" onClick={onConfirm}>
              Экспортировать
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
