import { useEffect, useState } from "react";
import {
  AiGatewayError,
  createChatCompletion,
} from "@/shared/api";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { buildWorkoutLogText } from "../lib/buildWorkoutLogText";
import { filterDaysByPeriod } from "../lib/filterDaysByPeriod";
import { buildUserPrompt, getSystemPrompt } from "../lib/prompts";
import {
  loadSavedRecommendation,
  saveRecommendation,
} from "../lib/recommendationStorage";
import {
  AI_RECOMMENDATION_KINDS,
  AI_RECOMMENDATION_PERIODS,
  getKindLabel,
  getPeriodLabel,
  type AiRecommendationKind,
  type AiRecommendationPeriod,
} from "../model/types";
import { MarkdownContent } from "./MarkdownContent";

export const AiRecommendationsPanel = () => {
  const [period, setPeriod] =
    useState<AiRecommendationPeriod>("last_workout");
  const [kind, setKind] = useState<AiRecommendationKind>("next_session");
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSaved = async () => {
      setError(null);
      setEmptyMessage(null);
      const saved = await loadSavedRecommendation(period, kind);
      if (cancelled) {
        return;
      }
      setResult(saved?.content ?? null);
    };

    void loadSaved();

    return () => {
      cancelled = true;
    };
  }, [period, kind]);

  const handleRequest = async () => {
    setError(null);
    setEmptyMessage(null);
    setLoading(true);

    try {
      const allDays = await readAllTrainingDaysFromStorage();
      const filtered = filterDaysByPeriod(allDays, period);
      const workoutLogText = buildWorkoutLogText(filtered);

      if (!workoutLogText.trim()) {
        setEmptyMessage(
          "Нет тренировок за выбранный период. Запишите подходы в журнале и попробуйте снова.",
        );
        return;
      }

      const trimmedQuery = customQuery.trim();
      if (kind === "custom" && !trimmedQuery) {
        setError("Введите ваш запрос — для типа «Свой запрос» текст обязателен.");
        return;
      }

      const periodLabel = getPeriodLabel(period);
      const kindLabel = getKindLabel(kind);
      const optionalCustom =
        kind === "custom" ? trimmedQuery : undefined;
      const response = await createChatCompletion([
        { role: "system", content: getSystemPrompt() },
        {
          role: "user",
          content: buildUserPrompt(
            periodLabel,
            kindLabel,
            workoutLogText,
            optionalCustom,
          ),
        },
      ]);

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) {
        setError("Шлюз вернул пустой ответ. Попробуйте ещё раз.");
        return;
      }

      await saveRecommendation(period, kind, content);
      setResult(content);
    } catch (err) {
      if (err instanceof AiGatewayError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim()) {
        setError(err.message);
      } else {
        setError("Не удалось получить рекомендации. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasSaved = Boolean(result);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">Период</p>
        <RadioGroup
          value={period}
          onValueChange={(value) =>
            setPeriod(value as AiRecommendationPeriod)
          }
          className="grid gap-2"
          disabled={loading}
        >
          {AI_RECOMMENDATION_PERIODS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <RadioGroupItem
                value={option.value}
                id={`ai-period-${option.value}`}
              />
              <Label
                htmlFor={`ai-period-${option.value}`}
                className="cursor-pointer text-sm text-foreground"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">Тип запроса</p>
        <RadioGroup
          value={kind}
          onValueChange={(value) => setKind(value as AiRecommendationKind)}
          className="grid gap-2"
          disabled={loading}
        >
          {AI_RECOMMENDATION_KINDS.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <RadioGroupItem
                value={option.value}
                id={`ai-kind-${option.value}`}
              />
              <Label
                htmlFor={`ai-kind-${option.value}`}
                className="cursor-pointer text-sm text-foreground"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {kind === "custom" ? (
        <div className="min-w-0 space-y-2">
          <label htmlFor="ai-custom-query" className="text-sm font-medium">
            Ваш запрос
          </label>
          <textarea
            id="ai-custom-query"
            rows={4}
            placeholder="Задайте свой вопрос тренеру"
            value={customQuery}
            onChange={(event) => setCustomQuery(event.target.value)}
            disabled={loading}
            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      ) : null}

      <Button
        type="button"
        onClick={() => void handleRequest()}
        disabled={loading}
      >
        {loading
          ? "Загрузка…"
          : hasSaved
            ? "Обновить рекомендации"
            : "Получить рекомендации"}
      </Button>

      {loading ? (
        <p className="text-sm text-muted-foreground">
          Анализируем журнал и готовим рекомендации…
        </p>
      ) : null}

      {emptyMessage ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-2 text-sm font-medium text-foreground">
            Рекомендации
          </p>
          <MarkdownContent content={result} />
        </div>
      ) : null}
    </div>
  );
};
