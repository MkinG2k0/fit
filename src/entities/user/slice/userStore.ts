import { create } from "zustand";
import type { IUser, IUserPersonalData } from "../model/types";
import type { WorkoutCalorieProfileOnboardingStatus } from "../model/workoutCalorieOnboarding";
import { isWorkoutCalorieProfileComplete } from "../lib/isWorkoutCalorieProfileComplete";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import { DEFAULT_RING_GOALS, type RingGoalsSettings } from "../model/ringGoals";

const DEFAULT_SET_DURATION_FALLBACK_SEC = 60;
const MIN_DEFAULT_SET_DURATION_SEC = 30;
const MAX_DEFAULT_SET_DURATION_SEC = 180;

const DEFAULT_REST_BETWEEN_SETS_SEC = 120;
const MIN_REST_BETWEEN_SETS_SEC = 30;
const MAX_REST_BETWEEN_SETS_SEC = 600;
const REST_BETWEEN_SETS_STEP_SEC = 30;

const clampDefaultSetDurationSec = (sec: number): number =>
  Math.min(
    MAX_DEFAULT_SET_DURATION_SEC,
    Math.max(MIN_DEFAULT_SET_DURATION_SEC, Math.round(sec)),
  );

const clampRestBetweenSetsSec = (sec: number): number => {
  if (!Number.isFinite(sec)) {
    return DEFAULT_REST_BETWEEN_SETS_SEC;
  }
  const snapped =
    Math.round(sec / REST_BETWEEN_SETS_STEP_SEC) * REST_BETWEEN_SETS_STEP_SEC;
  return Math.min(
    MAX_REST_BETWEEN_SETS_SEC,
    Math.max(MIN_REST_BETWEEN_SETS_SEC, snapped),
  );
};

export const clampTimerNotificationVolume = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(1, Math.max(0, value));
};

interface UserState {
  user: IUser;
  accessToken: string;
  personalData: IUserPersonalData;
  ringGoals: RingGoalsSettings;
  /** Фича: ккал на подход (Health / пульс). По умолчанию выкл. */
  workoutCaloriesEnabled: boolean;
  /** Средняя длительность подхода (сек) для первого окна без предыдущего endTime. */
  defaultSetDurationSec: number;
  /** Онбординг: вес/возраст/пол (persist в user). */
  workoutCalorieProfileOnboarding: WorkoutCalorieProfileOnboardingStatus;
  /** Подсказка прошлой тренировки в свёрнутой карточке упражнения. По умолчанию вкл. */
  exerciseCardShowLastSessionResult: boolean;
  /** Кнопка добавления всех подходов прошлой тренировки. По умолчанию выкл. */
  lastSessionFillButtonEnabled: boolean;
  /** Ккал в шапке карточки (имеет смысл при включённом учёте ккал в нативном приложении). */
  exerciseCardShowKcalInHeader: boolean;
  /** Суммарный объём (повторы × вес) в шапке карточки. */
  exerciseCardShowTotalVolumeInHeader: boolean;
  /** Перетаскивание карточек для смены порядка упражнений в списке дня. */
  exerciseCardReorderEnabled: boolean;
  /** Сводка «Общая информация о тренировке» над списком упражнений на день. */
  workoutListShowDaySummary: boolean;
  /** Автозапуск таймера отдыха после добавления подхода. */
  restBetweenSetsEnabled: boolean;
  /** Длительность отдыха между подходами (сек). По умолчанию 120. */
  restBetweenSetsSec: number;
  /** Звук, вибрация и системное уведомление при завершении таймера отдыха. */
  timerCompleteNotificationsEnabled: boolean;
  /** Громкость in-app Web Audio при завершении таймера (0–1). */
  timerNotificationVolume: number;
  /** Экспериментальное ИИ-заполнение подходов. По умолчанию выкл. */
  aiFillEnabled: boolean;
  /** Пункт «Таймер» в меню профиля. По умолчанию выкл. */
  timerMenuEnabled: boolean;
  /** Пункт «Параметры тела» в меню профиля. По умолчанию выкл. */
  bodyMetricsMenuEnabled: boolean;
  /** Пункт «Таблица нагрузок» в меню профиля. По умолчанию выкл. */
  loadTableMenuEnabled: boolean;
  /** Пункт «Активность» в меню профиля. По умолчанию выкл. */
  activityMenuEnabled: boolean;
}

interface ActionsState {
  addUserData: (user: IUser) => void;
  setPersonalData: (param: IUserPersonalData) => void;
  setRingGoals: (ringGoals: RingGoalsSettings) => void;
  setWorkoutCaloriesEnabled: (enabled: boolean) => void;
  setDefaultSetDurationSec: (sec: number) => void;
  setWorkoutCalorieProfileOnboarding: (
    status: WorkoutCalorieProfileOnboardingStatus,
  ) => void;
  setExerciseCardShowLastSessionResult: (enabled: boolean) => void;
  setLastSessionFillButtonEnabled: (enabled: boolean) => void;
  setExerciseCardShowKcalInHeader: (enabled: boolean) => void;
  setExerciseCardShowTotalVolumeInHeader: (enabled: boolean) => void;
  setExerciseCardReorderEnabled: (enabled: boolean) => void;
  setWorkoutListShowDaySummary: (enabled: boolean) => void;
  setRestBetweenSetsEnabled: (enabled: boolean) => void;
  setRestBetweenSetsSec: (sec: number) => void;
  setTimerCompleteNotificationsEnabled: (enabled: boolean) => void;
  setTimerNotificationVolume: (volume: number) => void;
  setAiFillEnabled: (enabled: boolean) => void;
  setTimerMenuEnabled: (enabled: boolean) => void;
  setBodyMetricsMenuEnabled: (enabled: boolean) => void;
  setLoadTableMenuEnabled: (enabled: boolean) => void;
  setActivityMenuEnabled: (enabled: boolean) => void;
  setAccessToken: (token: string) => void;
  deleteUserData: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState & ActionsState>()(
  persist(
    (set, _, store) => ({
      user: {
        userName: "",
      },
      personalData: {},
      ringGoals: DEFAULT_RING_GOALS,
      workoutCaloriesEnabled: false,
      defaultSetDurationSec: 60,
      workoutCalorieProfileOnboarding: "pending",
      exerciseCardShowLastSessionResult: true,
      lastSessionFillButtonEnabled: false,
      exerciseCardShowKcalInHeader: false,
      exerciseCardShowTotalVolumeInHeader: true,
      exerciseCardReorderEnabled: false,
      workoutListShowDaySummary: true,
      restBetweenSetsEnabled: true,
      restBetweenSetsSec: DEFAULT_REST_BETWEEN_SETS_SEC,
      timerCompleteNotificationsEnabled: true,
      timerNotificationVolume: 1,
      aiFillEnabled: false,
      timerMenuEnabled: false,
      bodyMetricsMenuEnabled: false,
      loadTableMenuEnabled: false,
      activityMenuEnabled: false,
      accessToken: "",

      setAccessToken: (token) => set({ accessToken: token }),

      addUserData: (userData) =>
        set(() => ({
          user: userData,
        })),

      setPersonalData: (param) =>
        set((state) => {
          const personalData: IUserPersonalData = {
            ...state.personalData,
            ...param,
          };
          return {
            personalData,
            workoutCalorieProfileOnboarding: isWorkoutCalorieProfileComplete(
              personalData,
            )
              ? "done"
              : state.workoutCalorieProfileOnboarding,
          };
        }),

      setRingGoals: (ringGoals) =>
        set(() => ({
          ringGoals,
        })),

      setWorkoutCaloriesEnabled: (enabled) =>
        set(() => ({
          workoutCaloriesEnabled: enabled,
          ...(enabled ? {} : { exerciseCardShowKcalInHeader: false }),
        })),

      setDefaultSetDurationSec: (sec) =>
        set(() => ({
          defaultSetDurationSec: clampDefaultSetDurationSec(sec),
        })),

      setWorkoutCalorieProfileOnboarding: (status) =>
        set(() => ({
          workoutCalorieProfileOnboarding: status,
        })),

      setExerciseCardShowLastSessionResult: (enabled) =>
        set(() => ({
          exerciseCardShowLastSessionResult: enabled,
          ...(enabled ? {} : { lastSessionFillButtonEnabled: false }),
        })),

      setLastSessionFillButtonEnabled: (enabled) =>
        set((state) => ({
          lastSessionFillButtonEnabled:
            enabled && state.exerciseCardShowLastSessionResult,
        })),

      setExerciseCardShowKcalInHeader: (enabled) =>
        set(() => ({
          exerciseCardShowKcalInHeader: enabled,
        })),

      setExerciseCardShowTotalVolumeInHeader: (enabled) =>
        set(() => ({
          exerciseCardShowTotalVolumeInHeader: enabled,
        })),

      setExerciseCardReorderEnabled: (enabled) =>
        set(() => ({
          exerciseCardReorderEnabled: enabled,
        })),

      setWorkoutListShowDaySummary: (enabled) =>
        set(() => ({
          workoutListShowDaySummary: enabled,
        })),

      setRestBetweenSetsEnabled: (enabled) =>
        set(() => ({
          restBetweenSetsEnabled: enabled,
        })),

      setRestBetweenSetsSec: (sec) =>
        set(() => ({
          restBetweenSetsSec: clampRestBetweenSetsSec(sec),
        })),

      setTimerCompleteNotificationsEnabled: (enabled) =>
        set(() => ({
          timerCompleteNotificationsEnabled: enabled,
        })),

      setTimerNotificationVolume: (volume) =>
        set(() => ({
          timerNotificationVolume: clampTimerNotificationVolume(volume),
        })),

      setAiFillEnabled: (enabled) =>
        set(() => ({
          aiFillEnabled: enabled,
        })),

      setTimerMenuEnabled: (enabled) =>
        set(() => ({
          timerMenuEnabled: enabled,
        })),

      setBodyMetricsMenuEnabled: (enabled) =>
        set(() => ({
          bodyMetricsMenuEnabled: enabled,
        })),

      setLoadTableMenuEnabled: (enabled) =>
        set(() => ({
          loadTableMenuEnabled: enabled,
        })),

      setActivityMenuEnabled: (enabled) =>
        set(() => ({
          activityMenuEnabled: enabled,
        })),

      deleteUserData: () =>
        set(() => ({
          user: {
            userName: "",
            accessToken: "",
          },
        })),

      reset: () => {
        set(store.getInitialState());
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => zustandAppStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<UserState & ActionsState>;
        const personalData: IUserPersonalData = {
          ...current.personalData,
          ...(p.personalData ?? {}),
        };
        let workoutCalorieProfileOnboarding = p.workoutCalorieProfileOnboarding;
        if (workoutCalorieProfileOnboarding === undefined) {
          workoutCalorieProfileOnboarding = isWorkoutCalorieProfileComplete(
            personalData,
          )
            ? "done"
            : "pending";
        }
        return {
          ...current,
          ...p,
          personalData,
          workoutCalorieProfileOnboarding,
          defaultSetDurationSec:
            typeof p.defaultSetDurationSec === "number" &&
            Number.isFinite(p.defaultSetDurationSec)
              ? clampDefaultSetDurationSec(p.defaultSetDurationSec)
              : current.defaultSetDurationSec,
          exerciseCardShowLastSessionResult:
            typeof p.exerciseCardShowLastSessionResult === "boolean"
              ? p.exerciseCardShowLastSessionResult
              : current.exerciseCardShowLastSessionResult,
          lastSessionFillButtonEnabled: (() => {
            const showLast =
              typeof p.exerciseCardShowLastSessionResult === "boolean"
                ? p.exerciseCardShowLastSessionResult
                : current.exerciseCardShowLastSessionResult;
            const fillEnabled =
              typeof p.lastSessionFillButtonEnabled === "boolean"
                ? p.lastSessionFillButtonEnabled
                : current.lastSessionFillButtonEnabled;
            return showLast && fillEnabled;
          })(),
          exerciseCardShowKcalInHeader:
            typeof p.exerciseCardShowKcalInHeader === "boolean"
              ? p.exerciseCardShowKcalInHeader
              : current.exerciseCardShowKcalInHeader,
          exerciseCardShowTotalVolumeInHeader:
            typeof p.exerciseCardShowTotalVolumeInHeader === "boolean"
              ? p.exerciseCardShowTotalVolumeInHeader
              : current.exerciseCardShowTotalVolumeInHeader,
          exerciseCardReorderEnabled:
            typeof p.exerciseCardReorderEnabled === "boolean"
              ? p.exerciseCardReorderEnabled
              : current.exerciseCardReorderEnabled,
          workoutListShowDaySummary:
            typeof p.workoutListShowDaySummary === "boolean"
              ? p.workoutListShowDaySummary
              : current.workoutListShowDaySummary,
          restBetweenSetsEnabled:
            typeof p.restBetweenSetsEnabled === "boolean"
              ? p.restBetweenSetsEnabled
              : current.restBetweenSetsEnabled,
          restBetweenSetsSec:
            typeof p.restBetweenSetsSec === "number" &&
            Number.isFinite(p.restBetweenSetsSec)
              ? clampRestBetweenSetsSec(p.restBetweenSetsSec)
              : current.restBetweenSetsSec,
          timerCompleteNotificationsEnabled:
            typeof p.timerCompleteNotificationsEnabled === "boolean"
              ? p.timerCompleteNotificationsEnabled
              : current.timerCompleteNotificationsEnabled,
          timerNotificationVolume:
            typeof p.timerNotificationVolume === "number" &&
            Number.isFinite(p.timerNotificationVolume)
              ? clampTimerNotificationVolume(p.timerNotificationVolume)
              : current.timerNotificationVolume,
          aiFillEnabled:
            typeof p.aiFillEnabled === "boolean"
              ? p.aiFillEnabled
              : current.aiFillEnabled,
          timerMenuEnabled:
            typeof p.timerMenuEnabled === "boolean"
              ? p.timerMenuEnabled
              : current.timerMenuEnabled,
          bodyMetricsMenuEnabled:
            typeof p.bodyMetricsMenuEnabled === "boolean"
              ? p.bodyMetricsMenuEnabled
              : current.bodyMetricsMenuEnabled,
          loadTableMenuEnabled:
            typeof p.loadTableMenuEnabled === "boolean"
              ? p.loadTableMenuEnabled
              : current.loadTableMenuEnabled,
          activityMenuEnabled:
            typeof p.activityMenuEnabled === "boolean"
              ? p.activityMenuEnabled
              : current.activityMenuEnabled,
        };
      },
    },
  ),
);

export {
  MIN_DEFAULT_SET_DURATION_SEC,
  MAX_DEFAULT_SET_DURATION_SEC,
  DEFAULT_SET_DURATION_FALLBACK_SEC,
  DEFAULT_REST_BETWEEN_SETS_SEC,
  MIN_REST_BETWEEN_SETS_SEC,
  MAX_REST_BETWEEN_SETS_SEC,
};
