const TONNAGE_SWITCH_KG = 1000;

type TonnageUnit = "кг" | "т";

interface TonnageParts {
  value: string;
  unit: TonnageUnit;
}

const formatKgValue = (valueInKg: number): string => {
  const roundedTenths = Math.round(valueInKg * 10) / 10;

  if (Number.isInteger(roundedTenths)) {
    return roundedTenths.toLocaleString("ru-RU", {
      maximumFractionDigits: 0,
    });
  }

  return roundedTenths.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const formatTonsValue = (valueInKg: number): string => {
  return (valueInKg / TONNAGE_SWITCH_KG).toFixed(1);
};

export const formatTonnageParts = (valueInKg: number): TonnageParts => {
  if (!Number.isFinite(valueInKg) || valueInKg <= 0) {
    return {
      value: "0",
      unit: "кг",
    };
  }

  if (valueInKg >= TONNAGE_SWITCH_KG) {
    return {
      value: formatTonsValue(valueInKg),
      unit: "т",
    };
  }

  return {
    value: formatKgValue(valueInKg),
    unit: "кг",
  };
};

export const formatTonnage = (valueInKg: number): string => {
  const formatted = formatTonnageParts(valueInKg);
  return `${formatted.value} ${formatted.unit}`;
};

