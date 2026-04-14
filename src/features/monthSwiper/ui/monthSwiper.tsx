import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Swiper } from "swiper/react";
import type { daysArray } from "@/entities/calendarDay";
import { daysRender } from "@/shared/lib";
import { PRELOAD_MONTHS, generateMonth } from "../lib";

interface MonthSwiperProps {
  selectedDate: dayjs.Dayjs;
  setObservableDate: (date: dayjs.Dayjs) => void;
}

export const MonthSwiper = ({
  selectedDate,
  setObservableDate,
}: MonthSwiperProps) => {
  const [months, setMonths] = useState(() => {
    const current = selectedDate.startOf("month");
    const initialMonths = [];
    for (let i = -PRELOAD_MONTHS; i <= PRELOAD_MONTHS; i++) {
      initialMonths.push(generateMonth(current.add(i, "month")));
    }
    return initialMonths;
  });

  const monthSwiperRef = useRef<any>(null);

  const handleMonthSlideChange = (swiper: any) => {
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
    <Swiper
      key={"month"}
      ref={monthSwiperRef}
      slidesPerView={1}
      onSlideChange={handleMonthSlideChange}
      initialSlide={PRELOAD_MONTHS}
    >
      {daysRender(months)}
    </Swiper>
  );
};
