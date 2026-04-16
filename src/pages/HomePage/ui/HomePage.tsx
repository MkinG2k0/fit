import { ExerciseList, Header, WeekSlider } from "@/widgets";

export const HomePage = () => {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden gap-2">
      <Header date title="Training" />
      <WeekSlider />
      <ExerciseList />
    </div>
  );
};
