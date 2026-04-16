import { ExerciseList, Header, WeekSlider } from "@/widgets";

export const HomePage = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header date title="Training" />
      <WeekSlider />
      <ExerciseList />
    </div>
  );
};
