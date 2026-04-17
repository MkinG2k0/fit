import type { ExerciseIconId } from "@/entities/exercise";
import { cn } from "@/shared/lib";
import { ExerciseIconGraphic } from "@/shared/ui";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface ExerciseIconOptionProps {
  iconId: ExerciseIconId;
  isSelected: boolean;
  onSelect: (iconId: ExerciseIconId) => void;
}

export const ExerciseIconOption = ({
  iconId,
  isSelected,
  onSelect,
}: ExerciseIconOptionProps) => {
  const handleClick = () => {
    onSelect(iconId);
  };

  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      size="icon"
      className="h-11 w-11 shrink-0 rounded-lg"
      aria-pressed={isSelected}
      aria-label={`Иконка ${iconId}`}
      onClick={handleClick}
    >
      <ExerciseIconGraphic iconId={iconId} className={cn("  ")} />
    </Button>
  );
};
