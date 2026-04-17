import {
  EXERCISE_ICON_PATHS,
  defaultIconIdForCategory,
  type ExerciseIconId,
} from "@/entities/exercise";
import { cn, publicAssetUrl } from "@/shared/lib";

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
  const resolvedIconId =
    iconId ?? (category ? defaultIconIdForCategory(category) : undefined);
  const relativePath =
    resolvedIconId !== undefined
      ? EXERCISE_ICON_PATHS[resolvedIconId]
      : EXERCISE_ICON_PATHS["nav-exercises"];

  return (
    <img
      alt=""
      draggable={false}
      src={publicAssetUrl(relativePath)}
      className={cn("object-contain", className)}
    />
  );
};
