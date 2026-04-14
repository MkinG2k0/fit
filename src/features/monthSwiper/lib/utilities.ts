import dayjs from "dayjs";
import type { daysArray } from "@/entities/calendarDay";

export const generateMonth = (start: dayjs.Dayjs): daysArray => {
  start = start.startOf("isoWeek");
  const days = Array.from({ length: 42 }, (_, i) => start.add(i, "day"));
  return { start, days };
};
