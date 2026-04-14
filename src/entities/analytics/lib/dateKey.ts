import dayjs from "dayjs";

const DATE_KEY_LENGTH = 3;
const DATE_KEY_PARTS = {
  day: 0,
  month: 1,
  year: 2,
};

export const parseDateKey = (dateKey: string) => {
  const dateParts = dateKey.split("-");
  if (dateParts.length !== DATE_KEY_LENGTH) {
    return null;
  }

  const day = Number(dateParts[DATE_KEY_PARTS.day]);
  const month = Number(dateParts[DATE_KEY_PARTS.month]);
  const year = Number(dateParts[DATE_KEY_PARTS.year]);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  const parsedDate = dayjs(new Date(year, month - 1, day));
  if (!parsedDate.isValid()) {
    return null;
  }

  return parsedDate;
};

export const compareDateKeysAsc = (leftDateKey: string, rightDateKey: string) => {
  const leftDate = parseDateKey(leftDateKey);
  const rightDate = parseDateKey(rightDateKey);
  if (!leftDate && !rightDate) {
    return 0;
  }
  if (!leftDate) {
    return 1;
  }
  if (!rightDate) {
    return -1;
  }

  return leftDate.valueOf() - rightDate.valueOf();
};

