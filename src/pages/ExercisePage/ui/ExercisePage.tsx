import { Header } from "@/widgets";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";
import { AllExercises } from "@/widgets/allExercises";

export const ExercisePage = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header title="Список упражнений" navigateBack />
      <Separator />
      <div className="min-h-0 flex-1">
        <AllExercises />
      </div>
    </div>
  );
};

