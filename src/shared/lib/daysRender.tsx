import dayjs from "dayjs";
import { SwiperSlide } from "swiper/react";
import { Day } from "@/entities/calendarDay/ui/Day";
import { type daysArray, useCalendarStore } from "@/entities/calendarDay";

const hasExercises = (date: dayjs.Dayjs) => {
  const day = date.format("DD-MM-YYYY");
  const days = useCalendarStore((state) => state.days);
  const dayExercises = days[day]?.exercises ?? [];
  return dayExercises.length > 0;
};

export const daysRender = (daysArray: daysArray[]) => {
  const observableDate = useCalendarStore((state) => state.observableDate);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);

  return daysArray.map((elem) => (
    <SwiperSlide key={elem.start.toString()}>
      <div className={"grid grid-cols-7 gap-y-5 mb-4"}>
        {elem.days.map((day, index) => {
          return (
            <div key={day.format("DD-MM-YYYY")}>
              <Day
                observableDate={observableDate}
                value={day}
                selectedDate={selectedDate}
                dayName={index < 7 ? day.format("dd") : undefined}
                onClickDate={setSelectedDate}
                hasExercises={hasExercises}
              />
            </div>
          );
        })}
      </div>
    </SwiperSlide>
  ));
};
