import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/shadCNComponents/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import { cn } from "@/shared/ui/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const containerClassName = "flex w-full items-center gap-2";
const triggerClassName = "min-w-0 flex-1 justify-between";
const clearButtonClassName = "h-8 w-8 shrink-0 p-0";
const optionBaseClassName = "flex items-center justify-between gap-2";
const selectedIconClassName = "text-primary";
const unselectedIconClassName = "opacity-0";
const popoverContentClassName = "w-72 p-0 sm:w-80";

export const SearchableSelect = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  onValueChange,
  className,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const handleClearClick = () => onValueChange("");
  const hasValue = value.length > 0;

  return (
    <div className={cn(containerClassName, className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={triggerClassName}>
            <span className="truncate text-left">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={popoverContentClassName} align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  const handleSelectOption = () => {
                    onValueChange(option.value);
                    setOpen(false);
                  };

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={handleSelectOption}
                    >
                      <span className={optionBaseClassName}>
                        {option.label}
                        <Check
                          className={cn(
                            "size-4",
                            isSelected
                              ? selectedIconClassName
                              : unselectedIconClassName,
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
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={clearButtonClassName}
        disabled={!hasValue}
        onClick={handleClearClick}
        aria-label="Очистить выбор"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};

