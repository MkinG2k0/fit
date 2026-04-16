import { SwiperSlide } from "swiper/react";
import type { Exercise } from "@/entities/exercise";
import { MIN_RING_GOAL_VALUE, useUserStore } from "@/entities/user";
import { Day } from "@/entities/calendarDay/ui/Day";
import { type daysArray, useCalendarStore } from "@/entities/calendarDay";

interface DayRingMetrics {
  setsProgress: number;
  volumeProgress: number;
  hasExercises: boolean;
}

interface DayStats {
  exerciseCount: number;
  setCount: number;
  volume: number;
}

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

const getSafeGoal = (value: number) =>
  Number.isFinite(value) && value >= MIN_RING_GOAL_VALUE
    ? value
    : MIN_RING_GOAL_VALUE;

const getDayStats = (exercises: Exercise[]): DayStats => {
  const exerciseCount = exercises.length;
  const setCount = exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
  const volume = exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (setTotal, currentSet) =>
          setTotal + currentSet.weight * currentSet.reps,
        0,
      ),
    0,
  );

  return {
    exerciseCount,
    setCount,
    volume,
  };
};

const getRingMetrics = (
  stats: DayStats,
  fullSetCountGoal: number,
  fullVolumeGoal: number,
): DayRingMetrics => {
  if (stats.exerciseCount === 0 && stats.setCount === 0 && stats.volume === 0) {
    return {
      setsProgress: 0,
      volumeProgress: 0,
      hasExercises: false,
    };
  }

  return {
    setsProgress: clampProgress(stats.setCount / fullSetCountGoal),
    volumeProgress: clampProgress(stats.volume / fullVolumeGoal),
    hasExercises: true,
  };
};

export const useDaysSlides = (daysArray: daysArray[]) => {
  const observableDate = useCalendarStore((state) => state.observableDate);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const days = useCalendarStore((state) => state.days);
  const ringGoals = useUserStore((state) => state.ringGoals);
  const fullSetCountGoal = getSafeGoal(ringGoals.fullSetCount);
  const fullVolumeGoal = getSafeGoal(ringGoals.fullVolume);

  return daysArray.map((elem, slideIndex) => {
    const dayStatsByKey = new Map<string, DayStats>();

    elem.days.forEach((day) => {
      const dayKey = day.format("DD-MM-YYYY");
      const dayExercises = days[dayKey]?.exercises ?? [];
      dayStatsByKey.set(dayKey, getDayStats(dayExercises));
    });

    return (
      <SwiperSlide key={elem.start.toString()} virtualIndex={slideIndex}>
        <div className={"mb-2 grid grid-cols-7 gap-y-3"}>
          {elem.days.map((day, index) => {
            const dayKey = day.format("DD-MM-YYYY");
            const dayStats = dayStatsByKey.get(dayKey) ?? {
              exerciseCount: 0,
              setCount: 0,
              volume: 0,
            };

            return (
              <div key={dayKey}>
                <Day
                  observableDate={observableDate}
                  value={day}
                  selectedDate={selectedDate}
                  dayName={index < 7 ? day.format("dd") : undefined}
                  onClickDate={setSelectedDate}
                  ringMetrics={getRingMetrics(
                    dayStats,
                    fullSetCountGoal,
                    fullVolumeGoal,
                  )}
                />
              </div>
            );
          })}
        </div>
      </SwiperSlide>
    );
  });
};
