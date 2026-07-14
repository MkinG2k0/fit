export interface NewsEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  summary: string;
}

export interface NewsWeekGroup {
  /** YYYY-MM-DD Monday (ISO week start) */
  weekStartDate: string;
  label: string;
  entries: NewsEntry[];
}
