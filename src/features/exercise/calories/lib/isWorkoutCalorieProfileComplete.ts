import type { IUserPersonalData } from "@/entities/user/model/types";

export const isWorkoutCalorieProfileComplete = (
  personal: IUserPersonalData,
): boolean => {
  const w = personal.weight;
  const age = personal.age;
  const gender = personal.gender;
  if (typeof w !== "number" || !Number.isFinite(w) || w <= 0) {
    return false;
  }
  if (typeof age !== "number" || !Number.isFinite(age) || age <= 0) {
    return false;
  }
  if (!gender || typeof gender !== "string") {
    return false;
  }
  const g = gender.trim().toLowerCase();
  return (
    g === "male" ||
    g === "female" ||
    g === "m" ||
    g === "f" ||
    g === "муж" ||
    g === "жен" ||
    g === "мужской" ||
    g === "женский"
  );
};
