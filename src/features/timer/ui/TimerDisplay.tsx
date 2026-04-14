import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { CircularCountdown } from "@/shared/ui/circularProgressBar/circularProgressBar";

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  initialMinutes: number;
  initialSeconds: number;
  isRunning: boolean;
  onTimeChange: (minutes: number, seconds: number) => void;
}

const formatTime = (number: number): string => {
  return number.toString().padStart(2, "0");
};

export const TimerDisplay = ({
  minutes,
  seconds,
  initialMinutes,
  initialSeconds,
  isRunning,
  onTimeChange,
}: TimerDisplayProps) => {
  return (
    <div className="relative">
      <CircularCountdown
        size={380}
        totalSeconds={initialMinutes * 60 + initialSeconds}
        currentSeconds={minutes * 60 + seconds}
        color={isRunning ? "black" : "#6b7280"}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Input
          className={`text-8xl disabled:opacity-100 min-[330px]:text-9xl h-auto w-auto border-none shadow-none font-light text-center transition-[font-weight,color] duration-500 ${
            isRunning ? "font-bold text-black" : "text-gray-500"
          }`}
          onChange={(e) =>
            onTimeChange(parseInt(e.target.value) || 0, initialSeconds)
          }
          disabled={isRunning}
          value={formatTime(minutes)}
        />
        <Input
          className={`text-8xl disabled:opacity-100 min-[330px]:text-9xl h-auto w-auto border-none shadow-none font-light text-center transition-[font-weight,color] duration-500 ${
            isRunning ? "font-bold text-black" : "text-gray-500"
          }`}
          onChange={(e) =>
            onTimeChange(initialMinutes, parseInt(e.target.value) || 0)
          }
          disabled={isRunning}
          value={formatTime(seconds)}
        />
      </div>
    </div>
  );
};

