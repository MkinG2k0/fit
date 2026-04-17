import {
  defaultIconIdForCategory,
  type ExerciseIconId,
} from "@/entities/exercise";
import { cn } from "@/shared/lib";
import { ExerciseIconGraphic } from "@/shared/ui";

interface ExerciseCategoryIconProps {
  category?: string;
  iconId?: ExerciseIconId;
  className?: string;
}

export const ExerciseCategoryIcon = ({
  category,
  iconId,
  className,
}: ExerciseCategoryIconProps) => {
  const resolvedIconId: ExerciseIconId =
    iconId ?? (category ? defaultIconIdForCategory(category) : undefined) ??
    "nav-exercises";

  return (
    <ExerciseIconGraphic
      iconId={resolvedIconId}
      className={cn("object-contain", className)}
    />
  );
};
