import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { Virtual } from "swiper/modules";
import { Swiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { daysArray } from "@/entities/calendarDay";
import { useDaysSlides, useSyncCalendarSwiperToDate } from "@/shared/lib";
import { generateWeek, PRELOAD_WEEKS } from "../lib";

interface WeekSwiperProps {
  selectedDate: dayjs.Dayjs;
  setObservableDate: (date: dayjs.Dayjs) => void;
}

export const WeekSwiper = ({
  selectedDate,
  setObservableDate,
}: WeekSwiperProps) => {
  const weekSwiperRef = useRef<{ swiper: SwiperType } | null>(null);

  const buildWeeksAroundTarget = useCallback((targetStart: dayjs.Dayjs) => {
    const initialWeeks: daysArray[] = [];
    for (let i = -PRELOAD_WEEKS; i <= PRELOAD_WEEKS; i++) {
      initialWeeks.push(generateWeek(targetStart.add(i, "week")));
    }
    return initialWeeks;
  }, []);

  const getTargetWeekStart = useCallback(
    (date: dayjs.Dayjs) => date.startOf("isoWeek"),
    [],
  );
  const [weeks, setWeeks] = useState<daysArray[]>(() =>
    buildWeeksAroundTarget(getTargetWeekStart(selectedDate)),
  );

  useSyncCalendarSwiperToDate({
    selectedDate,
    slides: weeks,
    setSlides: setWeeks,
    swiperRef: weekSwiperRef,
    preloadCount: PRELOAD_WEEKS,
    getTargetStart: getTargetWeekStart,
    buildSlidesAroundTarget: buildWeeksAroundTarget,
  });
  const weekSlides = useDaysSlides(weeks);

  const handleWeekSlideChange = (swiper: SwiperType) => {
    const { activeIndex } = swiper;
    const lastIndex = weeks.length - 1;
    setObservableDate(weeks[activeIndex].start.add(6, "day"));

    // если дошли до конца — добавляем ещё 5 недель вперёд
    if (activeIndex >= lastIndex - 2) {
      const nextStart = weeks[lastIndex].start.add(1, "week");
      const newWeeks: daysArray[] = [];
      for (let i = 0; i < PRELOAD_WEEKS; i++) {
        newWeeks.push(generateWeek(nextStart.add(i, "week")));
      }
      setWeeks((prev) => [...prev, ...newWeeks]);
    }

    // если дошли к началу — добавляем 5 недель назад
    if (activeIndex <= 2) {
      const prevStart = weeks[0].start.subtract(PRELOAD_WEEKS, "week");
      const newWeeks: daysArray[] = [];
      for (let i = 0; i < PRELOAD_WEEKS; i++) {
        newWeeks.push(generateWeek(prevStart.add(i, "week")));
      }
      setWeeks((prev) => [...newWeeks, ...prev]);
      setTimeout(() => swiper.slideTo(activeIndex + PRELOAD_WEEKS, 0), 0);
    }
  };

  return (
    <Swiper
      key={"week"}
      ref={weekSwiperRef}
      modules={[Virtual]}
      virtual={{
        addSlidesBefore: 1,
        addSlidesAfter: 1,
      }}
      slidesPerView={1}
      onSlideChange={handleWeekSlideChange}
      initialSlide={PRELOAD_WEEKS}
    >
      {weekSlides}
    </Swiper>
  );
};
