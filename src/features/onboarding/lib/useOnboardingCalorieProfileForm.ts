import { useCallback, useState } from "react";
import { useUserStore } from "@/entities/user";

const isFemaleStored = (g: string | undefined): boolean =>
  g === "female" ||
  g === "женский" ||
  g === "жен";

export const useOnboardingCalorieProfileForm = () => {
  const existing = useUserStore((s) => s.personalData);
  const setPersonalData = useUserStore((s) => s.setPersonalData);
  const setOnboarding = useUserStore((s) => s.setWorkoutCalorieProfileOnboarding);

  const [weight, setWeight] = useState(() =>
    existing.weight !== undefined ? String(existing.weight) : "",
  );
  const [age, setAge] = useState(() =>
    existing.age !== undefined ? String(existing.age) : "",
  );
  const [gender, setGender] = useState<"male" | "female">(() =>
    isFemaleStored(existing.gender) ? "female" : "male",
  );

  const handleSave = useCallback(() => {
    const w = Number.parseFloat(weight.replace(",", "."));
    const a = Number.parseInt(age, 10);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(a) || a <= 0) {
      return false;
    }
    setPersonalData({
      weight: w,
      age: a,
      gender,
    });
    return true;
  }, [age, gender, setPersonalData, weight]);

  const handleSkip = useCallback(() => {
    setOnboarding("skipped");
  }, [setOnboarding]);

  return {
    weight,
    age,
    gender,
    setWeight,
    setAge,
    setGender,
    handleSave,
    handleSkip,
  };
};
