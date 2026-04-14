import { Header } from "@/widgets";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";
import { AllExercises } from "@/widgets/allExercises";

export const ExercisePage = () => {
  return (
    <div>
      <Header title="Список упражнений" navigateBack />
      <Separator />
      <AllExercises />
    </div>
  );
};

