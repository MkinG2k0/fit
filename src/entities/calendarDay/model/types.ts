import dayjs from "dayjs";
import type { Exercise } from "../../exercise";

export interface CalendarDay {
  exercises: Exercise[];
}

export type daysArray = {
  start: dayjs.Dayjs;
  days: dayjs.Dayjs[];
};
