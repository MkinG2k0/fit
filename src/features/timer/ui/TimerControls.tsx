interface TimerControlsProps {
  isRunning: boolean;
  minutes: number;
  seconds: number;
  onStart: () => void;
  onReset: () => void;
}

export const TimerControls = ({
  isRunning,
  minutes,
  seconds,
  onStart,
  onReset,
}: TimerControlsProps) => {
  return (
    <div className="flex flex-col w-[50%] space-y-4 fixed bottom-5">
      <button
        type="button"
        onClick={onStart}
        className={`rounded bg-foreground px-6 py-2 text-2xl text-background transition-opacity duration-500 disabled:opacity-50 ${
          isRunning ? "opacity-70" : ""
        }`}
        disabled={minutes === 0 && seconds === 0 && !isRunning}
      >
        {isRunning ? "Пауза" : "Старт"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded bg-muted-foreground px-6 py-2 text-2xl text-background hover:opacity-90"
      >
        Сброс
      </button>
    </div>
  );
};

