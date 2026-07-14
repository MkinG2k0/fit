import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { useTimer } from "../lib/useTimer";

export const Timer = () => {
  const {
    minutes,
    seconds,
    initialMinutes,
    initialSeconds,
    isRunning,
    startTimer,
    resetTimer,
    setTime,
  } = useTimer();

  return (
    <div className="flex flex-col items-center">
      <TimerDisplay
        minutes={minutes}
        seconds={seconds}
        initialMinutes={initialMinutes}
        initialSeconds={initialSeconds}
        isRunning={isRunning}
        onTimeChange={setTime}
      />
      <TimerControls
        isRunning={isRunning}
        minutes={minutes}
        seconds={seconds}
        onStart={startTimer}
        onReset={resetTimer}
      />
    </div>
  );
};
