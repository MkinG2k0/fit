import {
  EXERCISE_ICON_PICKER_IDS,
  type ExerciseIconId,
} from "@/entities/exercise";
import { ExerciseIconOption } from "./ExerciseIconOption";

interface CreateExerciseIconSectionProps {
  selectedIconId: ExerciseIconId;
  onSelectIcon: (iconId: ExerciseIconId) => void;
}

export const CreateExerciseIconSection = ({
  selectedIconId,
  onSelectIcon,
}: CreateExerciseIconSectionProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <span id="exercise-icon-picker-label" className="text-sm font-medium">
        Иконка
      </span>
      <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2">
        <div
          className="flex w-max min-w-full flex-nowrap gap-2"
          role="listbox"
          aria-labelledby="exercise-icon-picker-label"
        >
          {EXERCISE_ICON_PICKER_IDS.map((iconId) => (
            <ExerciseIconOption
              key={iconId}
              iconId={iconId}
              isSelected={selectedIconId === iconId}
              onSelect={onSelectIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
