import type { KeyboardEvent } from "react";
import type { ExerciseIconId } from "@/entities/exercise";
import { cn } from "@/shared/lib";
import { ExerciseIconGraphic } from "@/shared/ui";

interface ExerciseIconOptionProps {
  iconId: ExerciseIconId;
  isSelected: boolean;
  onSelect: (iconId: ExerciseIconId) => void;
  className?: string;
}

export const ExerciseIconOption = ({
  iconId,
  isSelected,
  onSelect,
  className,
}: ExerciseIconOptionProps) => {
  const handleClick = () => {
    onSelect(iconId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSelect(iconId);
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      aria-label={`Иконка ${iconId}`}
      className={cn(
        "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isSelected
          ? "border-primary bg-primary/15 text-muted-foreground shadow-xs"
          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <ExerciseIconGraphic iconId={iconId} className="size-7" />
    </div>
  );
};
