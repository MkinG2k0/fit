import { type ChangeEvent, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { cn } from "@/shared/ui/lib/utils";

interface CreateCustomMetricCardProps {
  onCreateCustomMetric: (payload: { label: string; unit: string }) => void;
  className?: string;
}

export const CreateCustomMetricCard = ({
  onCreateCustomMetric,
  className,
}: CreateCustomMetricCardProps) => {
  const [customMetricLabel, setCustomMetricLabel] = useState("");
  const [customMetricUnit, setCustomMetricUnit] = useState("см");

  const handleCustomLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomMetricLabel(event.target.value);
  };

  const handleCustomUnitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomMetricUnit(event.target.value);
  };

  const handleCreateCustomMetricClick = () => {
    onCreateCustomMetric({
      label: customMetricLabel,
      unit: customMetricUnit,
    });
    setCustomMetricLabel("");
    setCustomMetricUnit("см");
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle>Новый параметр</CardTitle>
        <CardDescription>
          Добавьте свой параметр, чтобы он появился в селекте, истории и графике
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="body-metrics-custom-label">Название</Label>
            <Input
              id="body-metrics-custom-label"
              value={customMetricLabel}
              onChange={handleCustomLabelChange}
              placeholder="Например: Предплечье"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="body-metrics-custom-unit">Ед. измерения</Label>
            <Input
              id="body-metrics-custom-unit"
              value={customMetricUnit}
              onChange={handleCustomUnitChange}
              placeholder="см"
            />
          </div>
        </div>

        <Button type="button" variant="outline" onClick={handleCreateCustomMetricClick}>
          Добавить параметр в список
        </Button>
      </CardContent>
    </Card>
  );
};
