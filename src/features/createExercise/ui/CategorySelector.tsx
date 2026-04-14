import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/shadCNComponents/ui/command";
import type { ExerciseCategory } from "@/entities/exercise";
import type { RefObject } from "react";

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: (callback: () => void) => void;
  focused: boolean;
  commandRef: RefObject<HTMLDivElement | null>;
  allExercises: ExerciseCategory[];
}

export const CategorySelector = ({
  value,
  onValueChange,
  onFocus,
  onBlur,
  focused,
  commandRef,
  onSelect,
  allExercises,
}: CategorySelectorProps) => {
  return (
    <div ref={commandRef}>
      <Command>
        <CommandInput
          value={value}
          onValueChange={onValueChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Например: Ноги, Руки, Грудь..."
        />
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <CommandList className={"max-h-40"}>
                <CommandEmpty>Ничего не найдено</CommandEmpty>
                <CommandGroup heading="Категории">
                  {allExercises.map((group) => (
                    <CommandItem
                      onSelect={() =>
                        onSelect(() => onValueChange(group.category))
                      }
                      key={group.category}
                    >
                      {group.category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </motion.div>
          )}
        </AnimatePresence>
      </Command>
    </div>
  );
};
