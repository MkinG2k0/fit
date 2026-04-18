export const formatKcalOneDecimal = (kcal: number): string => {
  const rounded = Math.round(kcal * 10) / 10;
  return rounded.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};
