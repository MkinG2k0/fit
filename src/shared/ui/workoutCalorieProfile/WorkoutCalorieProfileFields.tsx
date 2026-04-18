import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { cn } from "@/shared/lib/classMerge";

export interface WorkoutCalorieProfileFieldsProps {
  weight: string;
  age: string;
  gender: "male" | "female";
  onWeightChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: "male" | "female") => void;
  weightInputId: string;
  ageInputId: string;
  maleRadioId: string;
  femaleRadioId: string;
  className?: string;
}

export const WorkoutCalorieProfileFields = ({
  weight,
  age,
  gender,
  onWeightChange,
  onAgeChange,
  onGenderChange,
  weightInputId,
  ageInputId,
  maleRadioId,
  femaleRadioId,
  className,
}: WorkoutCalorieProfileFieldsProps) => {
  return (
    <div className={cn("grid gap-4 py-2", className)}>
      <div className="grid gap-2">
        <Label htmlFor={weightInputId}>Вес, кг</Label>
        <Input
          id={weightInputId}
          inputMode="decimal"
          value={weight}
          onChange={(e) => {
            onWeightChange(e.target.value);
          }}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={ageInputId}>Возраст</Label>
        <Input
          id={ageInputId}
          inputMode="numeric"
          value={age}
          onChange={(e) => {
            onAgeChange(e.target.value);
          }}
        />
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Пол</span>
        <RadioGroup
          value={gender}
          onValueChange={(v) => {
            if (v === "male" || v === "female") {
              onGenderChange(v);
            }
          }}
          className="grid gap-2"
        >
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2">
            <RadioGroupItem value="male" id={maleRadioId} />
            <span className="text-sm">Мужской</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2">
            <RadioGroupItem value="female" id={femaleRadioId} />
            <span className="text-sm">Женский</span>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
};
