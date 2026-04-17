import { EXERCISE_ICON_PATHS, type ExerciseIconId } from "@/entities/exercise";
import { cn, publicAssetUrl } from "@/shared/lib";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

const optionIconClassName = "size-7 object-contain";

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
      <img
        alt=""
        draggable={false}
        src={publicAssetUrl(EXERCISE_ICON_PATHS[iconId])}
        className={cn(optionIconClassName)}
      />
    </Button>
  );
};
