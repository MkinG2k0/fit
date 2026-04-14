import { Timer } from "@/features/timer";
import { Header } from "@/widgets";

export const TimerPage = () => {
  return (
    <div>
      <Header title="Таймер" navigateBack />
      <Timer />
    </div>
  );
};

