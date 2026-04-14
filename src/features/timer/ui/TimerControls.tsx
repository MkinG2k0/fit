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
        onClick={onStart}
        className={`px-6 py-2 bg-black text-white text-2xl rounded transition-opacity duration-500 disabled:opacity-50 ${
          isRunning && "opacity-70"
        }`}
        disabled={minutes === 0 && seconds === 0 && !isRunning}
      >
        {isRunning ? "Пауза" : "Старт"}
      </button>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-gray-400 text-white text-2xl rounded hover:bg-gray-600"
      >
        Сброс
      </button>
    </div>
  );
};

