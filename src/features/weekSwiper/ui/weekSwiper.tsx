import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Swiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { daysArray } from "@/entities/calendarDay";
import { Days } from "@/shared/lib";
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
  const [weeks, setWeeks] = useState<daysArray[]>(() => {
    const current = selectedDate.startOf("isoWeek"); // 👉 Понедельник
    const initialWeeks: daysArray[] = [];

    // предзагрузка 5 недель до и после
    for (let i = -PRELOAD_WEEKS; i <= PRELOAD_WEEKS; i++) {
      initialWeeks.push(generateWeek(current.add(i, "week")));
    }
    return initialWeeks;
  });

  // useEffect(() => {
  //   const targetWeekStart = selectedDate.startOf("isoWeek");
  //   const targetWeekIndex = weeks.findIndex((week) =>
  //     week.start.isSame(targetWeekStart, "day"),
  //   );

  //   if (targetWeekIndex !== -1) {
  //     weekSwiperRef.current?.swiper?.slideTo(targetWeekIndex, 300);
  //     return;
  //   }

  //   const nextWeeks: daysArray[] = [];
  //   for (let i = -PRELOAD_WEEKS; i <= PRELOAD_WEEKS; i++) {
  //     nextWeeks.push(generateWeek(targetWeekStart.add(i, "week")));
  //   }

  //   setWeeks(nextWeeks);

  //   // Дожидаемся рендера нового массива и центрируемся на текущей неделе.
  //   setTimeout(() => {
  //     weekSwiperRef.current?.swiper?.slideTo(PRELOAD_WEEKS, 0);
  //   }, 0);
  // }, [selectedDate, weeks]);

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
    <div className={"p-2"}>
      <Swiper
        key={"week"}
        ref={weekSwiperRef}
        slidesPerView={1}
        onSlideChange={handleWeekSlideChange}
        initialSlide={PRELOAD_WEEKS}
      >
        <Days daysArray={weeks} />
      </Swiper>
    </div>
  );
};
