import { useRef, useState, useCallback, useEffect } from "react";

export const useTimer = (initialMinutes = 2, initialSeconds = 0) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [initialMinutesState, setInitialMinutesState] = useState(initialMinutes);
  const [initialSecondsState, setInitialSecondsState] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isRunning) {
      clearTimer();
      setIsRunning(false);
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            setMinutes((prevMinutes) => {
              if (prevMinutes > 0) {
                return prevMinutes - 1;
              } else {
                setIsRunning(false);
                return 0;
              }
            });
            return 59;
          }
        });
      }, 1000);
    }
  }, [isRunning, clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMinutes(initialMinutesState);
    setSeconds(initialSecondsState);
  }, [clearTimer, initialMinutesState, initialSecondsState]);

  const setTime = useCallback(
    (newMinutes: number, newSeconds: number) => {
      const clampedMinutes = Math.min(newMinutes, 60);
      const clampedSeconds = Math.min(newSeconds, 59);
      setMinutes(clampedMinutes);
      setSeconds(clampedSeconds);
      setInitialMinutesState(clampedMinutes);
      setInitialSecondsState(clampedSeconds);
    },
    [],
  );

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && isRunning) {
      clearTimer();
      setIsRunning(false);
    }
  }, [minutes, seconds, isRunning, clearTimer]);

  return {
    minutes,
    seconds,
    initialMinutes: initialMinutesState,
    initialSeconds: initialSecondsState,
    isRunning,
    startTimer,
    resetTimer,
    setTime,
  };
};

