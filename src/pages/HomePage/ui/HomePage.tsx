import { ExerciseList, Header, WeekSlider } from "@/widgets";

export const HomePage = () => {
  return (
    <div>
      <Header date title="Тренировки" />
      <WeekSlider />
      <ExerciseList />
    </div>
  );
};

