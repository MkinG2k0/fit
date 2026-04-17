import { Check, ChevronsUpDown } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  type BodyMetricDefinition,
  type BodyMetricsDraft,
  type BodyMetricsEntry,
} from "@/entities/bodyMetrics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/shadCNComponents/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import { cn } from "@/shared/ui/lib/utils";
import { useBodyMetricsForm } from "../lib/useBodyMetricsForm";

interface BodyMetricsFormProps {
  initialEntry?: BodyMetricsEntry | null;
  metricDefinitions: BodyMetricDefinition[];
  className?: string;
  onSubmit: (draft: BodyMetricsDraft, entryId: string | null) => void;
  onCancelEdit?: () => void;
}

const FORM_GRID_CLASS = "grid gap-3 sm:grid-cols-2";
const FIELD_CLASS = "grid gap-1.5";
const ERROR_CLASS =
  "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive";
const HINT_CLASS = "text-xs text-muted-foreground";
const METRIC_TRIGGER_CLASS = "w-full justify-between";
const METRIC_OPTION_CLASS = "flex items-center justify-between gap-2";
const METRIC_CHECK_VISIBLE_CLASS = "text-primary";
const METRIC_CHECK_HIDDEN_CLASS = "opacity-0";
const METRIC_POPOVER_CLASS = "w-[var(--radix-popover-trigger-width)] p-0";

export const BodyMetricsForm = ({
  initialEntry = null,
  metricDefinitions,
  className,
  onSubmit,
  onCancelEdit,
}: BodyMetricsFormProps) => {
  const {
    recordedAt,
    fields,
    selectedMetricKey,
    isEditing,
    fieldDefinitions,
    errorMessage,
    handleRecordedAtChange,
    handleFieldChange,
    handleSelectedMetricChange,
    clearSelectedMetricValue,
    validateAndBuildDraft,
  } = useBodyMetricsForm({
    metricDefinitions,
    initialEntry,
  });
  const [isMetricSelectOpen, setIsMetricSelectOpen] = useState(false);

  const handleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleRecordedAtChange(event.target.value);
  };

  const handleMetricOptionSelect = (nextKey: string) => {
    const selectedDefinitionByKey = fieldDefinitions.find(
      (definition) => definition.key === nextKey,
    );
    if (!selectedDefinitionByKey) {
      return;
    }

    handleSelectedMetricChange(selectedDefinitionByKey.key);
    setIsMetricSelectOpen(false);
  };

  const handleMetricInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFieldChange(selectedMetricKey, event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draft = validateAndBuildDraft();
    if (!draft) {
      return;
    }

    onSubmit(draft, initialEntry?.id ?? null);
    if (!isEditing) {
      clearSelectedMetricValue();
    }
  };

  const selectedDefinition = fieldDefinitions.find(
    (field) => field.key === selectedMetricKey,
  );
  if (!selectedDefinition) {
    return null;
  }
  const selectedMetricLabel = `${selectedDefinition.label} (${selectedDefinition.unit})`;

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle>{isEditing ? "Редактирование замеров" : "Новые замеры"}</CardTitle>
        <CardDescription>
          Укажите дату и заполните параметры тела для отслеживания прогресса
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-3 px-4">
          <div className={FIELD_CLASS}>
            <Label htmlFor="body-metrics-recorded-at">Дата</Label>
            <Input
              id="body-metrics-recorded-at"
              type="date"
              value={recordedAt}
              onChange={handleDateInputChange}
            />
          </div>

          <div className={FORM_GRID_CLASS}>
            <div className={FIELD_CLASS}>
              <Label htmlFor="body-metrics-parameter">Параметр</Label>
              <Popover open={isMetricSelectOpen} onOpenChange={setIsMetricSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="body-metrics-parameter"
                    type="button"
                    variant="outline"
                    className={METRIC_TRIGGER_CLASS}
                    aria-expanded={isMetricSelectOpen}
                  >
                    <span className="truncate text-left">{selectedMetricLabel}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={METRIC_POPOVER_CLASS} align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>Параметры не найдены</CommandEmpty>
                      <CommandGroup>
                        {fieldDefinitions.map((field) => {
                          const optionLabel = `${field.label} (${field.unit})`;
                          const isSelected = field.key === selectedMetricKey;
                          return (
                            <CommandItem
                              key={field.key}
                              value={field.key}
                              onSelect={() => handleMetricOptionSelect(field.key)}
                            >
                              <span className={METRIC_OPTION_CLASS}>
                                {optionLabel}
                                <Check
                                  className={cn(
                                    "size-4",
                                    isSelected
                                      ? METRIC_CHECK_VISIBLE_CLASS
                                      : METRIC_CHECK_HIDDEN_CLASS,
                                  )}
                                />
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className={FIELD_CLASS}>
              <Label htmlFor={selectedDefinition.key}>
                Значение ({selectedDefinition.unit})
              </Label>
              <Input
                id={selectedDefinition.key}
                type="number"
                inputMode="decimal"
                min={selectedDefinition.min}
                max={selectedDefinition.max}
                step={selectedDefinition.step}
                value={fields[selectedDefinition.key]}
                onChange={handleMetricInputChange}
                placeholder={`${selectedDefinition.min}-${selectedDefinition.max}`}
              />
            </div>
          </div>
          <p className={HINT_CLASS}>
            Один параметр сохраняется как отдельная запись. Для следующего параметра
            выберите его в списке и сохраните снова.
          </p>

          {(errorMessage ?? "").length > 0 && (
            <p className={ERROR_CLASS}>{errorMessage}</p>
          )}
        </CardContent>
        <CardFooter className="gap-2 px-4">
          <Button type="submit">{isEditing ? "Сохранить изменения" : "Сохранить"}</Button>
          {isEditing && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Отменить
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
