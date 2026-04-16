import { Header } from "@/widgets";
import { AllExercises } from "@/widgets/allExercises";

export const ExercisePage = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header title="Упражнения" navigateBack />

      <div className="min-h-0 flex-1">
        <AllExercises />
      </div>
    </div>
  );
};
