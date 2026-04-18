import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";
import dayjs from "dayjs";
import type { HealthDailyPoint, TodayHealthMetrics } from "../model/types";

const READ_METRICS = ["steps", "calories"] as const;

/** Сколько последних дней показывать в графике (включая сегодня). */
const HEALTH_CHART_DAY_COUNT = 14;

/** Базовые значения для тестового ряда в браузере (нет нативного Health). */
const DEMO_STEPS_BASE = 5200;
const DEMO_STEPS_SWING = 1900;
const DEMO_CALORIES_BASE = 210;
const DEMO_CALORIES_SWING = 95;

function buildDemoHealthSeries(): HealthDailyPoint[] {
  const points: HealthDailyPoint[] = [];
  for (let i = HEALTH_CHART_DAY_COUNT - 1; i >= 0; i -= 1) {
    const d = dayjs().subtract(i, "day").startOf("day");
    const key = d.format("YYYY-MM-DD");
    const dayIndex = HEALTH_CHART_DAY_COUNT - 1 - i;
    const steps =
      DEMO_STEPS_BASE +
      Math.round(
        DEMO_STEPS_SWING * Math.sin(dayIndex * 0.45) +
          420 * Math.cos(dayIndex * 0.31),
      );
    const calories =
      DEMO_CALORIES_BASE +
      Math.round(
        DEMO_CALORIES_SWING * Math.sin(dayIndex * 0.38 + 0.7) +
          35 * Math.cos(dayIndex * 0.22),
      );
    points.push({
      dateKey: key,
      label: d.format("DD.MM"),
      steps: Math.max(0, steps),
      calories: Math.max(0, calories),
    });
  }
  return points;
}

export type HealthAccessErrorCode =
  | "not_native"
  | "sdk_unavailable"
  | "permission_denied"
  | "fetch_failed";

export class HealthAccessError extends Error {
  readonly code: HealthAccessErrorCode;

  constructor(
    code: HealthAccessErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "HealthAccessError";
    this.code = code;
  }
}

export async function openHealthSettingsIfAndroid(): Promise<void> {
  if (Capacitor.getPlatform() === "android") {
    await Health.openHealthConnectSettings();
  }
}

async function assertSdkAvailable(): Promise<void> {
  const { available, reason } = await Health.isAvailable();
  if (!available) {
    throw new HealthAccessError(
      "sdk_unavailable",
      reason ?? "Сервисы здоровья недоступны на этом устройстве",
    );
  }
}

async function ensureReadAccess(): Promise<void> {
  const initial = await Health.checkAuthorization({
    read: [...READ_METRICS],
  });
  const hasSteps = initial.readAuthorized.includes("steps");
  const hasCalories = initial.readAuthorized.includes("calories");
  if (hasSteps && hasCalories) {
    return;
  }
  const granted = await Health.requestAuthorization({
    read: [...READ_METRICS],
  });
  const ok =
    granted.readAuthorized.includes("steps") &&
    granted.readAuthorized.includes("calories");
  if (!ok) {
    throw new HealthAccessError(
      "permission_denied",
      "Нужен доступ к шагам и активным калориям",
    );
  }
}

async function fetchDailySeries(): Promise<HealthDailyPoint[]> {
  const startDate = dayjs()
    .subtract(HEALTH_CHART_DAY_COUNT - 1, "day")
    .startOf("day")
    .toISOString();
  const endDate = dayjs().toISOString();

  const [stepsAgg, caloriesAgg] = await Promise.all([
    Health.queryAggregated({
      dataType: "steps",
      startDate,
      endDate,
      bucket: "day",
      aggregation: "sum",
    }),
    Health.queryAggregated({
      dataType: "calories",
      startDate,
      endDate,
      bucket: "day",
      aggregation: "sum",
    }),
  ]);

  const stepsByDay = new Map<string, number>();
  for (const s of stepsAgg.samples) {
    const key = dayjs(s.startDate).format("YYYY-MM-DD");
    stepsByDay.set(key, Math.round(s.value));
  }
  const caloriesByDay = new Map<string, number>();
  for (const s of caloriesAgg.samples) {
    const key = dayjs(s.startDate).format("YYYY-MM-DD");
    caloriesByDay.set(key, Math.round(s.value));
  }

  const points: HealthDailyPoint[] = [];
  for (let i = HEALTH_CHART_DAY_COUNT - 1; i >= 0; i -= 1) {
    const d = dayjs().subtract(i, "day").startOf("day");
    const key = d.format("YYYY-MM-DD");
    points.push({
      dateKey: key,
      label: d.format("DD.MM"),
      steps: stepsByDay.get(key) ?? 0,
      calories: caloriesByDay.get(key) ?? 0,
    });
  }
  return points;
}

export interface HealthPageData {
  today: TodayHealthMetrics;
  series: HealthDailyPoint[];
  /** В браузере показываются тестовые данные вместо Apple Health / Health Connect. */
  isDemo: boolean;
}

export async function loadHealthPageData(): Promise<HealthPageData> {
  if (!Capacitor.isNativePlatform()) {
    const series = buildDemoHealthSeries();
    const todayKey = dayjs().format("YYYY-MM-DD");
    const todayPoint =
      series.find((p) => p.dateKey === todayKey) ?? series[series.length - 1];
    return {
      today: {
        steps: todayPoint.steps,
        activeCaloriesKcal: todayPoint.calories,
      },
      series,
      isDemo: true,
    };
  }

  try {
    await assertSdkAvailable();
    await ensureReadAccess();
    const series = await fetchDailySeries();
    const todayKey = dayjs().format("YYYY-MM-DD");
    const todayPoint =
      series.find((p) => p.dateKey === todayKey) ?? series[series.length - 1];
    const today: TodayHealthMetrics = {
      steps: todayPoint?.steps ?? 0,
      activeCaloriesKcal: todayPoint?.calories ?? 0,
    };
    return { today, series, isDemo: false };
  } catch (e) {
    if (e instanceof HealthAccessError) {
      throw e;
    }
    throw new HealthAccessError("fetch_failed", "Не удалось получить данные", {
      cause: e,
    });
  }
}

export async function loadTodayHealthMetrics(): Promise<TodayHealthMetrics> {
  const { today } = await loadHealthPageData();
  return today;
}
