import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/lib/classMerge";
import { useSettingsTransfer } from "../lib/useSettingsTransfer";
import { ImportSettingsDialog } from "./ImportSettingsDialog";

interface SettingsTransferCardProps {
  className?: string;
}

const CARD_CLASS = "gap-3 py-4";
const CARD_HEADER_CLASS = "px-4";
const CARD_CONTENT_CLASS = "space-y-3 px-4";
const ACTION_ROW_CLASS = "flex flex-col gap-2 sm:flex-row sm:flex-wrap";

export const SettingsTransferCard = ({
  className,
}: SettingsTransferCardProps) => {
  const {
    fileInputRef,
    status,
    clearStatus,
    handleExport,
    handlePickImportFile,
    handleImportFileSelected,
    importOpen,
    handleCloseImport,
    pendingBundle,
    selectedSectionIds,
    handleToggleSection,
    handleConfirmImport,
    unknownSectionKeys,
    importableDefinitions,
  } = useSettingsTransfer();

  return (
    <Card className={cn(CARD_CLASS, className)}>
      <CardHeader className={CARD_HEADER_CLASS}>
        <CardTitle>Резервная копия настроек</CardTitle>
        <CardDescription>
          Экспорт и импорт вынесены в единый JSON-файл. Новые разделы можно
          добавлять в приложении без смены формата файла.
        </CardDescription>
      </CardHeader>
      <CardContent className={CARD_CONTENT_CLASS}>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Выберите JSON-файл с настройками"
          onChange={handleImportFileSelected}
        />
        <div className={ACTION_ROW_CLASS}>
          <Button type="button" variant="secondary" onClick={handleExport}>
            Экспорт настроек
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePickImportFile}
          >
            Импорт из файла
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          В файл попадают тема, каталог упражнений и пресеты, журнал тренировок
          по дням и профиль без токена входа. Импорт перезаписывает только
          отмеченные разделы.
        </p>
        {status ? (
          <div
            className={cn(
              "rounded-md border px-3 py-2 text-sm",
              status.variant === "success" &&
                "border-border bg-muted/40 text-foreground",
              status.variant === "error" &&
                "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            <p>{status.text}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-8 px-2 text-xs"
              onClick={clearStatus}
            >
              Скрыть
            </Button>
          </div>
        ) : null}
      </CardContent>
      <ImportSettingsDialog
        open={importOpen}
        bundle={pendingBundle}
        importableDefinitions={importableDefinitions}
        selectedSectionIds={selectedSectionIds}
        unknownSectionKeys={unknownSectionKeys}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseImport();
          }
        }}
        onToggleSection={handleToggleSection}
        onConfirm={handleConfirmImport}
      />
    </Card>
  );
};
