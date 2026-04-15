import dayjs, { Dayjs } from "dayjs";
import { cn, firstLetterToUpperCase } from "@/shared/lib";

const RING_SIZE = 44;
const RING_CENTER = 22;
const OUTER_RING_RADIUS = 19;
const INNER_RING_RADIUS = 14.5;
const DAY_BADGE_SIZE_CLASS = "h-6 w-6";

const LOW_VOLUME_THRESHOLD = 0.33;
const HIGH_VOLUME_THRESHOLD = 0.66;

interface DayRingMetrics {
  setsProgress: number;
  volumeProgress: number;
  hasExercises: boolean;
}

interface DayProps {
  ringMetrics: DayRingMetrics;
  value: Dayjs;
  selectedDate: Dayjs;
  onClickDate: (date: Dayjs) => void;
  dayName: string | undefined;
  observableDate: Dayjs;
}

const getCircleLength = (radius: number) => 2 * Math.PI * radius;

const getRingDash = (radius: number, progress: number) => {
  const ringLength = getCircleLength(radius);
  return {
    strokeDasharray: ringLength,
    strokeDashoffset: ringLength * (1 - progress),
  };
};

const getVolumeRingColor = (hasExercises: boolean, volumeProgress: number) => {
  if (!hasExercises) {
    return "stroke-muted-foreground/35";
  }

  if (volumeProgress >= HIGH_VOLUME_THRESHOLD) {
    return "stroke-foreground";
  }

  if (volumeProgress >= LOW_VOLUME_THRESHOLD) {
    return "stroke-primary";
  }

  return "stroke-primary/55";
};

export const Day = ({
  selectedDate,
  value,
  ringMetrics,
  onClickDate,
  dayName,
  observableDate,
}: DayProps) => {
  const key = value.format("DD-MM-YYYY");
  const todayFlag = dayjs().isSame(value, "day");
  const sameMonthFlag = observableDate.isSame(value, "month");
  const selectedFlag = dayjs(selectedDate).isSame(value, "day");
  const setsProgress = ringMetrics.setsProgress;
  const volumeProgress = ringMetrics.volumeProgress;
  const showVolumeRing = ringMetrics.hasExercises;

  const handleDateClick = () => {
    onClickDate(value);
  };

  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center w-full cursor-pointer",
        !sameMonthFlag && "opacity-50",
      )}
      key={key}
      onClick={handleDateClick}
    >
      <div className="font-bold">
        {dayName ? firstLetterToUpperCase(dayName) : ""}
      </div>

      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className={cn(
            "absolute inset-0 h-full w-full -rotate-90",
            selectedFlag && "drop-shadow-[0_0_2px_rgba(0,0,0,0.15)]",
          )}
          aria-hidden
        >
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={OUTER_RING_RADIUS}
            className="fill-none stroke-border"
            strokeWidth="3"
          />

          {showVolumeRing && (
            <>
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={INNER_RING_RADIUS}
                className="fill-none stroke-border"
                strokeWidth="3"
              />
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={INNER_RING_RADIUS}
                className={cn(
                  "fill-none transition-[stroke-dashoffset] duration-300",
                  getVolumeRingColor(ringMetrics.hasExercises, volumeProgress),
                )}
                strokeWidth={selectedFlag ? "3.5" : "3"}
                strokeLinecap="round"
                {...getRingDash(INNER_RING_RADIUS, volumeProgress)}
              />
            </>
          )}

          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={OUTER_RING_RADIUS}
            className="fill-none stroke-primary transition-[stroke-dashoffset] duration-300"
            strokeWidth="3"
            strokeLinecap="round"
            {...getRingDash(OUTER_RING_RADIUS, setsProgress)}
          />
        </svg>

        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full text-base",
            DAY_BADGE_SIZE_CLASS,
            selectedFlag && "bg-primary! text-primary-foreground",
            todayFlag && "bg-primary/50 text-primary-foreground",
          )}
        >
          {value.format("D")}
        </div>
      </div>
    </button>
  );
};
