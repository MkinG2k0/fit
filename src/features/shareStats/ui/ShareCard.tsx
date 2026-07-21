import { forwardRef } from "react";
import type { ShareModel, ShareSparkPoint } from "../model/types";
import { cn, formatTonnageParts } from "@/shared/lib";

interface ShareCardProps {
  model: ShareModel;
  className?: string;
}

const SPARKLINE_WIDTH = 952;
const SPARKLINE_HEIGHT = 320;
const SPARKLINE_VERTICAL_PADDING = 24;
const MAX_VISIBLE_WORKOUT_EXERCISES = 8;

const formatWeight = (value: number): string => {
  return value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  });
};

const buildSparklinePoints = (sparkline: ShareSparkPoint[]): string => {
  if (sparkline.length === 0) {
    return "";
  }

  const values = sparkline.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  const drawableHeight = SPARKLINE_HEIGHT - SPARKLINE_VERTICAL_PADDING * 2;

  if (sparkline.length === 1) {
    const y = SPARKLINE_HEIGHT / 2;
    return `0,${y} ${SPARKLINE_WIDTH},${y}`;
  }

  return sparkline
    .map((point, index) => {
      const x = (index / (sparkline.length - 1)) * SPARKLINE_WIDTH;
      const normalizedValue =
        valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange;
      const y =
        SPARKLINE_HEIGHT -
        SPARKLINE_VERTICAL_PADDING -
        normalizedValue * drawableHeight;

      return `${x},${y}`;
    })
    .join(" ");
};

// The capture pipeline requires a forwarded DOM ref on the fixed-size root.
// eslint-disable-next-line react-x/no-forward-ref
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ model, className }, ref) => {
    const tonnage =
      model.kind === "empty" ? null : formatTonnageParts(model.tonnageKg);
    const visibleWorkoutExercises =
      model.kind === "workout"
        ? model.exercises.slice(0, MAX_VISIBLE_WORKOUT_EXERCISES)
        : [];
    const omittedWorkoutExerciseCount =
      model.kind === "workout"
        ? model.exercises.length - visibleWorkoutExercises.length
        : 0;

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[1920px] w-[1080px] flex-col bg-background p-16 text-foreground",
          className,
        )}
      >
        {model.kind === "empty" && (
          <div className="flex flex-1 items-center justify-center">
            <p className="max-w-3xl text-center text-5xl font-semibold leading-tight text-muted-foreground">
              {model.message}
            </p>
          </div>
        )}

        {model.kind === "exercise" && tonnage && (
          <main className="flex flex-1 flex-col">
            <div>
              <p className="text-3xl font-semibold text-primary">
                {model.category}
              </p>
              <h1 className="mt-5 text-8xl font-extrabold leading-none tracking-tight">
                {model.title}
              </h1>
              <div className="mt-10 flex items-center gap-5 text-3xl font-medium text-muted-foreground">
                <span>{model.periodLabel}</span>
                <span aria-hidden="true">•</span>
                <span>{model.dateRangeLabel}</span>
              </div>
            </div>

            <section className="mt-20 rounded-3xl border border-border bg-card p-12">
              <p className="text-3xl font-semibold text-muted-foreground">
                Максимальный вес
              </p>
              <div className="mt-8 flex items-baseline gap-8 tabular-nums">
                <p className="text-7xl font-bold text-muted-foreground">
                  {model.maxWeightFrom === null
                    ? "—"
                    : formatWeight(model.maxWeightFrom)}
                  <span className="ml-3 text-3xl font-semibold">кг</span>
                </p>
                <span className="text-6xl text-primary" aria-hidden="true">
                  →
                </span>
                <p className="text-9xl font-extrabold text-primary">
                  {formatWeight(model.maxWeightTo)}
                  <span className="ml-3 text-4xl font-semibold">кг</span>
                </p>
              </div>
            </section>

            <section className="mt-16">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold text-muted-foreground">
                    {model.sparklineMetric === "tonnage"
                      ? "Динамика тоннажа"
                      : "Динамика веса"}
                  </p>
                  <p className="mt-3 text-2xl text-muted-foreground">
                    {model.sparkline.length} точек прогресса
                  </p>
                </div>
                <p className="text-3xl font-semibold text-muted-foreground">
                  {model.sessionCount} тренировок
                </p>
              </div>
              <div className="mt-10 rounded-3xl border border-border bg-card p-8">
                {model.sparkline.length > 0 ? (
                  <svg
                    viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                    role="img"
                    aria-label={
                      model.sparklineMetric === "tonnage"
                        ? "График изменения тоннажа"
                        : "График изменения максимального веса"
                    }
                    className="h-80 w-full text-primary"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points={buildSparklinePoints(model.sparkline)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <div className="flex h-80 items-center justify-center text-3xl font-medium text-muted-foreground">
                    Недостаточно данных для графика
                  </div>
                )}
              </div>
            </section>

            <section className="mt-auto grid grid-cols-2 gap-6 pt-16">
              <div className="rounded-3xl border border-border bg-card p-10">
                <p className="text-2xl font-semibold text-muted-foreground">
                  Тоннаж
                </p>
                <p className="mt-4 text-6xl font-extrabold tabular-nums">
                  {tonnage.value}
                  <span className="ml-3 text-3xl font-semibold text-muted-foreground">
                    {tonnage.unit}
                  </span>
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-10">
                <p className="text-2xl font-semibold text-muted-foreground">
                  Тренировки
                </p>
                <p className="mt-4 text-6xl font-extrabold tabular-nums">
                  {model.sessionCount}
                </p>
              </div>
            </section>
          </main>
        )}

        {model.kind === "workout" && tonnage && (
          <main className="flex flex-1 flex-col">
            <div>
              <p className="text-3xl font-semibold text-primary">Тренировка</p>
              <h1 className="mt-5 text-8xl font-extrabold leading-none tracking-tight">
                {model.dateLabel}
              </h1>
            </div>

            <section className="mt-20 flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold">Упражнения</h2>
                <p className="text-3xl font-semibold text-muted-foreground">
                  {model.exerciseCount}
                </p>
              </div>
              <div
                className={cn(
                  "mt-8 grid",
                  model.exercises.length > 5 ? "gap-3" : "gap-5",
                )}
              >
                {visibleWorkoutExercises.map((exercise) => {
                  return (
                    <article
                      key={
                        exercise.id ??
                        `${exercise.name}-${exercise.setsSummary}-${exercise.tonnageKg}`
                      }
                      className={cn(
                        "rounded-3xl border border-border bg-card px-10",
                        model.exercises.length > 5 ? "py-4" : "py-8",
                      )}
                    >
                      <h3
                        className={cn(
                          "font-bold",
                          model.exercises.length > 5
                            ? "text-3xl"
                            : "text-4xl",
                        )}
                      >
                        {exercise.name}
                      </h3>
                      <p
                        className={cn(
                          "font-medium leading-snug text-muted-foreground",
                          model.exercises.length > 5
                            ? "mt-1 text-xl"
                            : "mt-3 text-2xl",
                        )}
                      >
                        {exercise.setsSummary}
                      </p>
                    </article>
                  );
                })}
                {omittedWorkoutExerciseCount > 0 && (
                  <p className="py-2 text-center text-3xl font-semibold text-muted-foreground">
                    +{omittedWorkoutExerciseCount} ещё
                  </p>
                )}
              </div>
            </section>

            <section className="mt-16 rounded-3xl border border-border bg-card p-12">
              <p className="text-3xl font-semibold text-muted-foreground">
                Итого за тренировку
              </p>
              <div className="mt-6 flex items-end justify-between">
                <p className="text-8xl font-extrabold tabular-nums text-primary">
                  {tonnage.value}
                  <span className="ml-3 text-4xl font-semibold">
                    {tonnage.unit}
                  </span>
                </p>
                <p className="pb-2 text-3xl font-semibold text-muted-foreground">
                  {model.exerciseCount} упражнений
                </p>
              </div>
            </section>
          </main>
        )}

        {model.kind === "period" && tonnage && (
          <main className="flex flex-1 flex-col">
            <div>
              <p className="text-3xl font-semibold text-primary">
                Итоги периода
              </p>
              <h1 className="mt-5 text-8xl font-extrabold leading-none tracking-tight">
                {model.periodLabel}
              </h1>
              <p className="mt-8 text-3xl font-medium text-muted-foreground">
                {model.dateRangeLabel}
              </p>
            </div>

            <section className="mt-20 grid grid-cols-2 gap-6">
              <div className="rounded-3xl border border-border bg-card p-10">
                <p className="text-2xl font-semibold text-muted-foreground">
                  Общий тоннаж
                </p>
                <p className="mt-5 text-6xl font-extrabold tabular-nums text-primary">
                  {tonnage.value}
                  <span className="ml-3 text-3xl font-semibold">
                    {tonnage.unit}
                  </span>
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-10">
                <p className="text-2xl font-semibold text-muted-foreground">
                  Дней с тренировками
                </p>
                <p className="mt-5 text-6xl font-extrabold tabular-nums">
                  {model.trainingDays}
                </p>
              </div>
            </section>

            <section className="mt-16">
              <div className="border-b border-border pb-6">
                <p className="text-2xl font-semibold uppercase tracking-widest text-muted-foreground">
                  Упражнения
                </p>
                <h2 className="mt-3 text-5xl font-bold">
                  {model.topExercises.length > 0
                    ? `${model.topExercises.length} в списке`
                    : "Нет выбранных"}
                </h2>
                <p className="mt-4 text-2xl font-medium text-muted-foreground">
                  Макс. вес в начале периода → в конце
                </p>
              </div>
              <ol className="mt-6 grid gap-1">
                {model.topExercises.map((exercise, index) => {
                  return (
                    <li
                      key={exercise.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-border py-6"
                    >
                      <span className="text-3xl font-extrabold tabular-nums text-primary">
                        {index + 1}
                      </span>
                      <span className="min-w-0 truncate text-3xl font-bold">
                        {exercise.name}
                      </span>
                      <div className="text-right tabular-nums">
                        <p className="flex items-baseline justify-end gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {formatWeight(exercise.maxWeightFrom)}
                          </span>
                          <span
                            className="text-2xl text-primary"
                            aria-hidden="true"
                          >
                            →
                          </span>
                          <span className="text-3xl font-extrabold text-primary">
                            {formatWeight(exercise.maxWeightTo)}
                            <span className="ml-2 text-xl font-semibold text-muted-foreground">
                              кг
                            </span>
                          </span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        )}
      </div>
    );
  },
);

ShareCard.displayName = "ShareCard";
