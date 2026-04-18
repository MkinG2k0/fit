import { useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { useUserStore } from "@/entities/user";
import { cn } from "@/shared/lib/classMerge";

interface WorkoutCalorieProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const radioRowClass =
  "flex items-center gap-2 rounded-md border border-border px-3 py-2";

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
    existing.gender === "female" ||
    existing.gender === "женский" ||
    existing.gender === "жен"
      ? "female"
      : "male",
  );

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
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="wc-weight">Вес, кг</Label>
            <Input
              id="wc-weight"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wc-age">Возраст</Label>
            <Input
              id="wc-age"
              inputMode="numeric"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
              }}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Пол</span>
            <RadioGroup
              value={gender}
              onValueChange={(v) => {
                if (v === "male" || v === "female") {
                  setGender(v);
                }
              }}
              className="grid gap-2"
            >
              <label className={cn(radioRowClass, "cursor-pointer")}>
                <RadioGroupItem value="male" id="wc-male" />
                <span className="text-sm">Мужской</span>
              </label>
              <label className={cn(radioRowClass, "cursor-pointer")}>
                <RadioGroupItem value="female" id="wc-female" />
                <span className="text-sm">Женский</span>
              </label>
            </RadioGroup>
          </div>
        </div>
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
