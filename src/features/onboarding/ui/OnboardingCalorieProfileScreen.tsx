import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { WorkoutCalorieProfileFields } from "@/shared/ui";
import { useOnboardingCalorieProfileForm } from "../lib/useOnboardingCalorieProfileForm";

export const OnboardingCalorieProfileScreen = () => {
  const navigate = useNavigate();
  const {
    weight,
    age,
    gender,
    setWeight,
    setAge,
    setGender,
    handleSave,
    handleSkip,
  } = useOnboardingCalorieProfileForm();

  const handleSubmit = () => {
    const ok = handleSave();
    if (ok) {
      navigate("/", { replace: true });
    }
  };

  const handleLater = () => {
    handleSkip();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 pb-6 pt-10 text-foreground">
      <div className="mx-auto w-full max-w-md flex-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Данные для расчёта ккал
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Вес, возраст и пол нужны для оценки калорий на подход (по пульсу или
          MET). Данные сохраняются локально в приложении. Заполнить можно
          сейчас или позже в настройках.
        </p>
        <WorkoutCalorieProfileFields
          weight={weight}
          age={age}
          gender={gender}
          onWeightChange={setWeight}
          onAgeChange={setAge}
          onGenderChange={setGender}
          weightInputId="onb-wc-weight"
          ageInputId="onb-wc-age"
          maleRadioId="onb-wc-male"
          femaleRadioId="onb-wc-female"
          className="mt-6"
        />
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3">
        <Button type="button" onClick={handleSubmit}>
          Сохранить
        </Button>
        <Button type="button" variant="secondary" onClick={handleLater}>
          Позже
        </Button>
      </div>
    </div>
  );
};
