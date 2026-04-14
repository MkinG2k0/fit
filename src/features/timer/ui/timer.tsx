import { useEffect } from "react";
import { useTimer } from "../lib/useTimer";
import { playNotificationSound, sendPushNotification } from "../lib/notifications";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";

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
  } = useTimer(2, 0);

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && isRunning) {
      playNotificationSound();
      sendPushNotification();
    }
  }, [minutes, seconds, isRunning]);

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
