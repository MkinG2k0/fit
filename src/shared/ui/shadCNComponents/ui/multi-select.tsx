import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  placeholder: string;
  emptyText: string;
  searchPlaceholder?: string;
  className?: string;
  onSelectedValuesChange: (values: string[]) => void;
}

const TRIGGER_CLASS = "w-full justify-between";
const CONTENT_CLASS = "w-[var(--radix-popover-trigger-width)] p-0";

export const MultiSelect = ({
  options,
  selectedValues,
  placeholder,
  emptyText,
  searchPlaceholder = "Поиск...",
  className,
  onSelectedValuesChange,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedValueSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const selectedOptions = useMemo(() => {
    return options.filter((option) => selectedValueSet.has(option.value));
  }, [options, selectedValueSet]);

  const triggerLabel =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length <= 2
        ? selectedOptions.map((option) => option.label).join(", ")
        : `Выбрано: ${selectedOptions.length}`;

  const handleOptionSelect = (value: string) => {
    if (selectedValueSet.has(value)) {
      onSelectedValuesChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onSelectedValuesChange([...selectedValues, value]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn(TRIGGER_CLASS, className)}>
          <span className="truncate text-left">{triggerLabel}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={CONTENT_CLASS}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValueSet.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleOptionSelect(option.value)}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      {option.label}
                      <Check className={cn("size-4", isSelected ? "text-primary" : "opacity-0")} />
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
