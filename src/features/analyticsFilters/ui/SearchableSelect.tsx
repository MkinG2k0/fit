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
    <div className={cn("flex w-full items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-0 flex-1 justify-between">
            <span className="truncate text-left">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-1.5rem)] p-0"
          align="start"
        >
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
                      <span className="flex items-center justify-between gap-2">
                        {option.label}
                        <Check
                          className={cn(
                            "size-4",
                            isSelected ? "text-primary" : "opacity-0",
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
        className="h-8 w-8 shrink-0 p-0"
        disabled={!hasValue}
        onClick={handleClearClick}
        aria-label="Очистить выбор"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};

