import { ThemeSettingsCard } from "@/features/themeSwitcher";
import { SettingsTransferCard } from "@/features/appSettingsTransfer";
import { ProfileRingGoalsSettingsCard } from "@/features/profileRingGoalsSettings";
import {
  DefaultExercisesSettingsCard,
  ExerciseCardDisplaySettingsCard,
  RestBetweenSetsSettingsCard,
  WorkoutCaloriesSettingsCard,
  WorkoutSummaryDisplaySettingsCard,
} from "@/features/exercise";
import { TimerNotificationsSettingsCard } from "@/features/timer";

export const SettingsPage = () => {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-3 sm:gap-4">
      <p className="text-sm text-muted-foreground">
        Персонализация и системные параметры приложения
      </p>

      <ThemeSettingsCard />

      <ProfileRingGoalsSettingsCard />

      <WorkoutCaloriesSettingsCard />

      <WorkoutSummaryDisplaySettingsCard />

      <RestBetweenSetsSettingsCard />

      <ExerciseCardDisplaySettingsCard />

      <DefaultExercisesSettingsCard />

      <TimerNotificationsSettingsCard />

      <SettingsTransferCard />
    </div>
  );
};
