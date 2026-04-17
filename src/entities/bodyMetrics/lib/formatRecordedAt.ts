export const formatBodyMetricsRecordedAt = (recordedAt: string): string => {
  const parsedDate = new Date(recordedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return recordedAt;
  }

  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
