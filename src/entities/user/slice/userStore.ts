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

const clampDefaultSetDurationSec = (sec: number): number =>
  Math.min(
    MAX_DEFAULT_SET_DURATION_SEC,
    Math.max(MIN_DEFAULT_SET_DURATION_SEC, Math.round(sec)),
  );

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
  /** Подсказка прошлой тренировки в свёрнутой карточке упражнения. */
  exerciseCardShowLastSessionResult: boolean;
  /** Ккал в шапке карточки (имеет смысл при включённом учёте ккал в нативном приложении). */
  exerciseCardShowKcalInHeader: boolean;
  /** Суммарный объём (повторы × вес) в шапке карточки. */
  exerciseCardShowTotalVolumeInHeader: boolean;
  /** Сводка «Общая информация о тренировке» над списком упражнений на день. */
  workoutListShowDaySummary: boolean;
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
  setExerciseCardShowKcalInHeader: (enabled: boolean) => void;
  setExerciseCardShowTotalVolumeInHeader: (enabled: boolean) => void;
  setWorkoutListShowDaySummary: (enabled: boolean) => void;
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
      exerciseCardShowLastSessionResult: false,
      exerciseCardShowKcalInHeader: false,
      exerciseCardShowTotalVolumeInHeader: true,
      workoutListShowDaySummary: true,
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
        })),

      setExerciseCardShowKcalInHeader: (enabled) =>
        set(() => ({
          exerciseCardShowKcalInHeader: enabled,
        })),

      setExerciseCardShowTotalVolumeInHeader: (enabled) =>
        set(() => ({
          exerciseCardShowTotalVolumeInHeader: enabled,
        })),

      setWorkoutListShowDaySummary: (enabled) =>
        set(() => ({
          workoutListShowDaySummary: enabled,
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
          exerciseCardShowKcalInHeader:
            typeof p.exerciseCardShowKcalInHeader === "boolean"
              ? p.exerciseCardShowKcalInHeader
              : current.exerciseCardShowKcalInHeader,
          exerciseCardShowTotalVolumeInHeader:
            typeof p.exerciseCardShowTotalVolumeInHeader === "boolean"
              ? p.exerciseCardShowTotalVolumeInHeader
              : current.exerciseCardShowTotalVolumeInHeader,
          workoutListShowDaySummary:
            typeof p.workoutListShowDaySummary === "boolean"
              ? p.workoutListShowDaySummary
              : current.workoutListShowDaySummary,
        };
      },
    },
  ),
);

export {
  MIN_DEFAULT_SET_DURATION_SEC,
  MAX_DEFAULT_SET_DURATION_SEC,
  DEFAULT_SET_DURATION_FALLBACK_SEC,
};
