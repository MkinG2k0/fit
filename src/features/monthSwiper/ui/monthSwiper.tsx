import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { Swiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { daysArray } from "@/entities/calendarDay";
import { daysRender, useSyncCalendarSwiperToDate } from "@/shared/lib";
import { PRELOAD_MONTHS, generateMonth } from "../lib";

interface MonthSwiperProps {
  selectedDate: dayjs.Dayjs;
  setObservableDate: (date: dayjs.Dayjs) => void;
}

export const MonthSwiper = ({
  selectedDate,
  setObservableDate,
}: MonthSwiperProps) => {
  const monthSwiperRef = useRef<{ swiper: SwiperType } | null>(null);
  const buildMonthsAroundTarget = useCallback((targetStart: dayjs.Dayjs) => {
    const initialMonths: daysArray[] = [];
    for (let i = -PRELOAD_MONTHS; i <= PRELOAD_MONTHS; i++) {
      initialMonths.push(generateMonth(targetStart.add(i, "month")));
    }
    return initialMonths;
  }, []);
  const getTargetMonthStart = useCallback(
    (date: dayjs.Dayjs) => date.startOf("month").startOf("isoWeek"),
    [],
  );
  const [months, setMonths] = useState<daysArray[]>(() =>
    buildMonthsAroundTarget(getTargetMonthStart(selectedDate)),
  );

  useSyncCalendarSwiperToDate({
    selectedDate,
    slides: months,
    setSlides: setMonths,
    swiperRef: monthSwiperRef,
    preloadCount: PRELOAD_MONTHS,
    getTargetStart: getTargetMonthStart,
    buildSlidesAroundTarget: buildMonthsAroundTarget,
  });

  const handleMonthSlideChange = (swiper: SwiperType) => {
    const { activeIndex } = swiper;
    const lastIndex = months.length - 1;
    setObservableDate(months[activeIndex].start.add(15, "day"));

    if (activeIndex >= lastIndex - 2) {
      const nextStart = months[lastIndex].start.add(1, "month");
      const newMonths: daysArray[] = [];
      for (let i = 0; i < PRELOAD_MONTHS; i++) {
        newMonths.push(generateMonth(nextStart.add(i, "month")));
      }
      setMonths((prev) => [...prev, ...newMonths]);
    }

    if (activeIndex <= 2) {
      const prevStart = months[0].start.subtract(PRELOAD_MONTHS, "month");
      const newMonths: daysArray[] = [];
      for (let i = 0; i < PRELOAD_MONTHS; i++) {
        newMonths.push(generateMonth(prevStart.add(i, "month")));
      }
      setMonths((prev) => [...newMonths, ...prev]);
      setTimeout(() => swiper.slideTo(activeIndex + PRELOAD_MONTHS, 0), 0);
    }
  };

  return (
    <div className={"p-2"}>
      <Swiper
        key={"month"}
        ref={monthSwiperRef}
        slidesPerView={1}
        onSlideChange={handleMonthSlideChange}
        initialSlide={PRELOAD_MONTHS}
      >
        {daysRender(months)}
      </Swiper>
    </div>
  );
};
