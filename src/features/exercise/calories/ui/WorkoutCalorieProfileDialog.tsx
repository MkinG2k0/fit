import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { WorkoutCalorieProfileFields } from "@/shared/ui";
import { useUserStore } from "@/entities/user";

interface WorkoutCalorieProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isFemaleStored = (g: string | undefined): boolean =>
  g === "female" ||
  g === "женский" ||
  g === "жен";

export const WorkoutCalorieProfileDialog = ({
  open,
  onOpenChange,
}: WorkoutCalorieProfileDialogProps) => {
  const setPersonalData = useUserStore((s) => s.setPersonalData);
  const existing = useUserStore((s) => s.personalData);

  const [weight, setWeight] = useState(() =>
    existing.weight !== undefined ? String(existing.weight) : "",
  );
  const [age, setAge] = useState(() =>
    existing.age !== undefined ? String(existing.age) : "",
  );
  const [gender, setGender] = useState<"male" | "female">(() =>
    isFemaleStored(existing.gender) ? "female" : "male",
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const pd = useUserStore.getState().personalData;
    setWeight(pd.weight !== undefined ? String(pd.weight) : "");
    setAge(pd.age !== undefined ? String(pd.age) : "");
    setGender(isFemaleStored(pd.gender) ? "female" : "male");
  }, [open]);

  const handleSubmit = () => {
    const w = Number.parseFloat(weight.replace(",", "."));
    const a = Number.parseInt(age, 10);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(a) || a <= 0) {
      return;
    }
    setPersonalData({
      weight: w,
      age: a,
      gender,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Данные для расчёта ккал</DialogTitle>
          <DialogDescription>
            Вес, возраст и пол нужны для оценки калорий на подход (по пульсу или
            MET).
          </DialogDescription>
        </DialogHeader>
        <WorkoutCalorieProfileFields
          weight={weight}
          age={age}
          gender={gender}
          onWeightChange={setWeight}
          onAgeChange={setAge}
          onGenderChange={setGender}
          weightInputId="wc-weight"
          ageInputId="wc-age"
          maleRadioId="wc-male"
          femaleRadioId="wc-female"
        />
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Позже
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
