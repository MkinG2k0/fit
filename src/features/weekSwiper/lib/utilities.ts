import dayjs from "dayjs";
import type { daysArray } from "@/entities/calendarDay";

export const generateWeek = (start: dayjs.Dayjs): daysArray => {
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
  return { start, days };
};
