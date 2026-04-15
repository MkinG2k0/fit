import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Swiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { daysArray } from "@/entities/calendarDay";
import { Days } from "@/shared/lib";
import { PRELOAD_MONTHS, generateMonth } from "../lib";

interface MonthSwiperProps {
  selectedDate: dayjs.Dayjs;
  setObservableDate: (date: dayjs.Dayjs) => void;
}

export const MonthSwiper = ({
  selectedDate,
  setObservableDate,
}: MonthSwiperProps) => {
  const [months, setMonths] = useState<daysArray[]>(() => {
    const current = selectedDate.startOf("month");
    const initialMonths: daysArray[] = [];
    for (let i = -PRELOAD_MONTHS; i <= PRELOAD_MONTHS; i++) {
      initialMonths.push(generateMonth(current.add(i, "month")));
    }
    return initialMonths;
  });

  const monthSwiperRef = useRef<{ swiper: SwiperType } | null>(null);

  useEffect(() => {
    const targetMonthStart = selectedDate.startOf("month").startOf("isoWeek");
    const targetMonthIndex = months.findIndex((month) =>
      month.start.isSame(targetMonthStart, "day"),
    );

    if (targetMonthIndex !== -1) {
      monthSwiperRef.current?.swiper?.slideTo(targetMonthIndex, 300);
      return;
    }

    const nextMonths: daysArray[] = [];
    for (let i = -PRELOAD_MONTHS; i <= PRELOAD_MONTHS; i++) {
      nextMonths.push(
        generateMonth(selectedDate.startOf("month").add(i, "month")),
      );
    }

    setMonths(nextMonths);

    // Дожидаемся рендера нового массива и центрируемся на текущем месяце.
    setTimeout(() => {
      monthSwiperRef.current?.swiper?.slideTo(PRELOAD_MONTHS, 0);
    }, 0);
  }, [selectedDate, months]);

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
        <Days daysArray={months} />
      </Swiper>
    </div>
  );
};
