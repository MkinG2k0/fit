import dayjs from "dayjs";
import "dayjs/locale/ru";
import isoWeek from "dayjs/plugin/isoWeek";
import type { NewsEntry, NewsWeekGroup } from "../model/types";

dayjs.extend(isoWeek);
dayjs.locale("ru");

const formatWeekLabel = (weekStart: dayjs.Dayjs): string => {
  const weekEnd = weekStart.endOf("isoWeek");

  if (
    weekStart.month() === weekEnd.month() &&
    weekStart.year() === weekEnd.year()
  ) {
    return `${weekStart.format("D")}–${weekEnd.format("D MMMM YYYY")}`;
  }

  return `${weekStart.format("D MMMM")} – ${weekEnd.format("D MMMM YYYY")}`;
};

export const groupNewsByWeek = (entries: NewsEntry[]): NewsWeekGroup[] => {
  if (entries.length === 0) {
    return [];
  }

  const byWeek = new Map<string, NewsEntry[]>();

  for (const entry of entries) {
    const weekStartDate = dayjs(entry.date).startOf("isoWeek").format("YYYY-MM-DD");
    const list = byWeek.get(weekStartDate) ?? [];
    list.push(entry);
    byWeek.set(weekStartDate, list);
  }

  const weekStarts = [...byWeek.keys()].sort((a, b) => b.localeCompare(a));

  return weekStarts.map((weekStartDate) => {
    const weekEntries = (byWeek.get(weekStartDate) ?? [])
      .slice()
      .sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      );

    return {
      weekStartDate,
      label: formatWeekLabel(dayjs(weekStartDate)),
      entries: weekEntries,
    };
  });
};
