import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Target } from "lucide-react";
import {
  DEFAULT_RING_GOALS,
  MIN_RING_GOAL_VALUE,
  useUserStore,
} from "@/entities/user";
import { AiGatewayError } from "@/shared/api";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { cn } from "@/shared/lib/classMerge";
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
import { suggestRingGoalsFromHistory } from "../lib/suggestRingGoalsFromHistory";

interface ProfileRingGoalsSettingsCardProps {
  className?: string;
}

const VALID_INTEGER_PATTERN = /^\d+$/;

const parseGoalValue = (value: string): number | null => {
  const normalized = value.trim();
  if (!VALID_INTEGER_PATTERN.test(normalized)) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < MIN_RING_GOAL_VALUE) {
    return null;
  }
  return parsed;
};

export const ProfileRingGoalsSettingsCard = ({
  className,
}: ProfileRingGoalsSettingsCardProps) => {
  const ringGoals = useUserStore((state) => state.ringGoals);
  const setRingGoals = useUserStore((state) => state.setRingGoals);
  const [setCountGoalInput, setSetCountGoalInput] = useState(
    String(ringGoals.fullSetCount),
  );
  const [volumeGoalInput, setVolumeGoalInput] = useState(
    String(ringGoals.fullVolume),
  );
  const [validationMessage, setValidationMessage] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const aiSuggestionGenerationRef = useRef(0);

  useEffect(() => {
    setSetCountGoalInput(String(ringGoals.fullSetCount));
    setVolumeGoalInput(String(ringGoals.fullVolume));
  }, [ringGoals.fullSetCount, ringGoals.fullVolume]);

  const isDirty = useMemo(
    () =>
      setCountGoalInput.trim() !== String(ringGoals.fullSetCount) ||
      volumeGoalInput.trim() !== String(ringGoals.fullVolume),
    [
      ringGoals.fullSetCount,
      ringGoals.fullVolume,
      setCountGoalInput,
      volumeGoalInput,
    ],
  );

  const handleSetGoalInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSetCountGoalInput(event.target.value);
  };

  const handleVolumeGoalInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setVolumeGoalInput(event.target.value);
  };

  const handleSaveRingGoals = () => {
    aiSuggestionGenerationRef.current += 1;
    setSuccessMessage("");
    const parsedSetGoal = parseGoalValue(setCountGoalInput);
    const parsedVolumeGoal = parseGoalValue(volumeGoalInput);

    if (parsedSetGoal === null || parsedVolumeGoal === null) {
      setValidationMessage("Введите целые числа не меньше 1.");
      return;
    }

    setRingGoals({
      fullSetCount: parsedSetGoal,
      fullVolume: parsedVolumeGoal,
    });
    setValidationMessage("");
  };

  const handleResetRingGoals = () => {
    aiSuggestionGenerationRef.current += 1;
    setRingGoals(DEFAULT_RING_GOALS);
    setValidationMessage("");
    setSuccessMessage("");
  };

  const handleSuggestAiRingGoals = async () => {
    if (isSuggesting) {
      return;
    }

    const suggestionGeneration = aiSuggestionGenerationRef.current + 1;
    aiSuggestionGenerationRef.current = suggestionGeneration;
    setIsSuggesting(true);
    setValidationMessage("");
    setSuccessMessage("");

    try {
      const days = await readAllTrainingDaysFromStorage();
      const goals = await suggestRingGoalsFromHistory(days);
      if (suggestionGeneration !== aiSuggestionGenerationRef.current) {
        return;
      }
      setRingGoals(goals);
      setSuccessMessage("Цель сохранена по истории за 3 месяца");
    } catch (error) {
      if (suggestionGeneration !== aiSuggestionGenerationRef.current) {
        return;
      }
      if (error instanceof AiGatewayError) {
        setValidationMessage(error.message);
      } else if (error instanceof Error && error.message.trim()) {
        setValidationMessage(error.message);
      } else {
        setValidationMessage("Не удалось получить ИИ-цель. Попробуйте позже.");
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          Цели колец календаря
        </CardTitle>
        <CardDescription>
          Настройте, какое количество подходов и объема считается 100% прогресса
          для дневных колец
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ring-set-goal">Подходы для полного круга</Label>
            <Input
              id="ring-set-goal"
              inputMode="numeric"
              value={setCountGoalInput}
              onChange={handleSetGoalInputChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ring-volume-goal">Объем для полного круга</Label>
            <Input
              id="ring-volume-goal"
              inputMode="numeric"
              value={volumeGoalInput}
              onChange={handleVolumeGoalInputChange}
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          По умолчанию: {DEFAULT_RING_GOALS.fullSetCount} подходов и{" "}
          {DEFAULT_RING_GOALS.fullVolume} объема.
        </p>

        <div className="mt-1 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleSaveRingGoals}
            disabled={!isDirty}
          >
            Сохранить
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetRingGoals}
          >
            Сбросить по умолчанию
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handleSuggestAiRingGoals();
            }}
            disabled={isSuggesting}
          >
            {isSuggesting ? "Считаем…" : "ИИ цель"}
          </Button>
        </div>

        {successMessage ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {successMessage}
          </p>
        ) : null}
        {validationMessage ? (
          <p className="mt-2 text-sm text-destructive">{validationMessage}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};
