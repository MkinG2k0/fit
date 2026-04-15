import { SwiperSlide } from "swiper/react";
import type { Exercise } from "@/entities/exercise";
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

/** Не от недели/месяца — иначе один день даёт разный % и разные цвета колец в разных режимах. */
const RING_FULL_SET_COUNT = 20;
const RING_FULL_VOLUME = 8000;

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

const getRingMetrics = (stats: DayStats): DayRingMetrics => {
  if (stats.exerciseCount === 0 && stats.setCount === 0 && stats.volume === 0) {
    return {
      setsProgress: 0,
      volumeProgress: 0,
      hasExercises: false,
    };
  }

  return {
    setsProgress: clampProgress(stats.setCount / RING_FULL_SET_COUNT),
    volumeProgress: clampProgress(stats.volume / RING_FULL_VOLUME),
    hasExercises: true,
  };
};

export const useDaysSlides = (daysArray: daysArray[]) => {
  const observableDate = useCalendarStore((state) => state.observableDate);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const days = useCalendarStore((state) => state.days);

  return daysArray.map((elem) => {
    const dayStatsByKey = new Map<string, DayStats>();

    elem.days.forEach((day) => {
      const dayKey = day.format("DD-MM-YYYY");
      const dayExercises = days[dayKey]?.exercises ?? [];
      dayStatsByKey.set(dayKey, getDayStats(dayExercises));
    });

    return (
      <SwiperSlide key={elem.start.toString()}>
        <div className={"mb-4 grid grid-cols-7 gap-y-3"}>
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
                  ringMetrics={getRingMetrics(dayStats)}
                />
              </div>
            );
          })}
        </div>
      </SwiperSlide>
    );
  });
};
