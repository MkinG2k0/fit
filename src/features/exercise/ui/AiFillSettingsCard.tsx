import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/entities/user";
import { cn } from "@/shared/lib/classMerge";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";

interface AiFillSettingsCardProps {
  className?: string;
}

export const AiFillSettingsCard = ({ className }: AiFillSettingsCardProps) => {
  const aiFillEnabled = useUserStore((s) => s.aiFillEnabled ?? false);
  const setAiFillEnabled = useUserStore((s) => s.setAiFillEnabled);

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setAiFillEnabled(value === true);
    },
    [setAiFillEnabled],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-muted-foreground" aria-hidden />
          ИИ-заполнение
        </CardTitle>
        <CardDescription>
          Экспериментальное автозаполнение подходов с помощью ИИ по истории
          упражнения
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="ai-fill-enabled"
            checked={aiFillEnabled}
            onCheckedChange={handleCheckedChange}
            aria-describedby="ai-fill-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="ai-fill-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Показывать кнопку ИИ-заполнения
            </Label>
            <p
              id="ai-fill-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              Если выключить, кнопка «ИИ-заполнение» скрыта в карточке
              упражнения.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
