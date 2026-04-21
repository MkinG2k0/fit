import { useExerciseStore } from "@/entities/exercise";
import { useThemeStore } from "@/entities/theme";
import { useUserStore } from "@/entities/user";
import {
  DEFAULT_RING_GOALS,
  type IUser,
  type IUserPersonalData,
  type RingGoalsSettings,
} from "@/entities/user";
import { isPlainObject, isZustandPersistBlob } from "@/shared/lib/appSettingsTransfer";
import { appStorage } from "@/shared/lib/storageAdapter";
import type { AppSettingsSectionDefinition } from "../model/types";
import { exportWorkoutJournalSnapshot, importWorkoutJournalSnapshot } from "./workoutJournalTransfer";

const THEME_STORAGE_KEY = "theme-preferences";
const EXERCISE_STORAGE_KEY = "exercise-store";
const USER_STORAGE_KEY = "user";

const clampExportedDefaultSetDurationSec = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 60;
  }
  return Math.min(180, Math.max(30, Math.round(value)));
};

export const APP_SETTINGS_SECTION_IDS = {
  theme: "theme",
  exercises: "exercises",
  workoutJournal: "workoutJournal",
  userProfile: "userProfile",
} as const;

const readJsonFromStorage = async (key: string): Promise<unknown | null> => {
  const raw = await appStorage.getString(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const writeJsonToStorage = async (key: string, value: unknown) => {
  await appStorage.setJson(key, value);
};

const assertPersistBlob = (value: unknown, label: string): void => {
  if (!isZustandPersistBlob(value)) {
    throw new Error(`${label}: ожидался сохранённый фрагмент Zustand (поле state).`);
  }
};

const isRingGoalsSettings = (value: unknown): value is RingGoalsSettings => {
  if (!isPlainObject(value)) {
    return false;
  }
  if (
    typeof value.fullSetCount !== "number" ||
    !Number.isFinite(value.fullSetCount) ||
    value.fullSetCount < 1
  ) {
    return false;
  }
  if (
    typeof value.fullVolume !== "number" ||
    !Number.isFinite(value.fullVolume) ||
    value.fullVolume < 1
  ) {
    return false;
  }
  return true;
};

const isUserProfileExport = (
  value: unknown,
): value is {
  user: IUser;
  personalData: IUserPersonalData;
  ringGoals: RingGoalsSettings;
  workoutCaloriesEnabled?: boolean;
  defaultSetDurationSec?: number;
  exerciseCardShowLastSessionResult?: boolean;
  exerciseCardShowKcalInHeader?: boolean;
  exerciseCardShowTotalVolumeInHeader?: boolean;
  workoutListShowDaySummary?: boolean;
} => {
  if (!isPlainObject(value)) {
    return false;
  }
  if (!isPlainObject(value.user) || typeof value.user.userName !== "string") {
    return false;
  }
  if (!isPlainObject(value.personalData)) {
    return false;
  }
  if (!isRingGoalsSettings(value.ringGoals)) {
    return false;
  }
  if (
    "workoutCaloriesEnabled" in value &&
    typeof value.workoutCaloriesEnabled !== "boolean"
  ) {
    return false;
  }
  if (
    "defaultSetDurationSec" in value &&
    value.defaultSetDurationSec !== undefined &&
    (typeof value.defaultSetDurationSec !== "number" ||
      !Number.isFinite(value.defaultSetDurationSec))
  ) {
    return false;
  }
  if (
    "exerciseCardShowLastSessionResult" in value &&
    typeof value.exerciseCardShowLastSessionResult !== "boolean"
  ) {
    return false;
  }
  if (
    "exerciseCardShowKcalInHeader" in value &&
    typeof value.exerciseCardShowKcalInHeader !== "boolean"
  ) {
    return false;
  }
  if (
    "exerciseCardShowTotalVolumeInHeader" in value &&
    typeof value.exerciseCardShowTotalVolumeInHeader !== "boolean"
  ) {
    return false;
  }
  if (
    "workoutListShowDaySummary" in value &&
    typeof value.workoutListShowDaySummary !== "boolean"
  ) {
    return false;
  }
  return true;
};

export const getAppSettingsSectionDefinitions = (): AppSettingsSectionDefinition[] => [
  {
    id: APP_SETTINGS_SECTION_IDS.theme,
    title: "Тема оформления",
    description: "Светлая, тёмная или системная тема",
    exportSnapshot: () => readJsonFromStorage(THEME_STORAGE_KEY),
    importSnapshot: async (payload: unknown) => {
      assertPersistBlob(payload, "Тема");
      await writeJsonToStorage(THEME_STORAGE_KEY, payload);
      void useThemeStore.persist.rehydrate();
    },
  },
  {
    id: APP_SETTINGS_SECTION_IDS.exercises,
    title: "Каталог упражнений и пресеты",
    description: "Пользовательские упражнения, категории и тренировочные пресеты",
    exportSnapshot: () => readJsonFromStorage(EXERCISE_STORAGE_KEY),
    importSnapshot: async (payload: unknown) => {
      assertPersistBlob(payload, "Упражнения");
      await writeJsonToStorage(EXERCISE_STORAGE_KEY, payload);
      void useExerciseStore.persist.rehydrate();
    },
  },
  {
    id: APP_SETTINGS_SECTION_IDS.workoutJournal,
    title: "Журнал тренировок",
    description:
      "Записи по дням (вес, повторы) по всем месяцам в локальном хранилище",
    exportSnapshot: async () => exportWorkoutJournalSnapshot(),
    importSnapshot: async (payload: unknown) => {
      await importWorkoutJournalSnapshot(payload);
    },
  },
  {
    id: APP_SETTINGS_SECTION_IDS.userProfile,
    title: "Профиль (без токена входа)",
    description: "Имя пользователя и персональные поля. Секретные данные входа не экспортируются.",
    exportSnapshot: async () => {
      const parsed = await readJsonFromStorage(USER_STORAGE_KEY);
      if (!isZustandPersistBlob(parsed) || !isPlainObject(parsed.state)) {
        return null;
      }
      const state = parsed.state as {
        user?: IUser;
        personalData?: IUserPersonalData;
        ringGoals?: RingGoalsSettings;
        workoutCaloriesEnabled?: boolean;
        defaultSetDurationSec?: number;
        exerciseCardShowLastSessionResult?: boolean;
        exerciseCardShowKcalInHeader?: boolean;
        exerciseCardShowTotalVolumeInHeader?: boolean;
        workoutListShowDaySummary?: boolean;
      };
      return {
        user: state.user ?? { userName: "" },
        personalData: state.personalData ?? {},
        ringGoals: state.ringGoals ?? DEFAULT_RING_GOALS,
        workoutCaloriesEnabled: state.workoutCaloriesEnabled ?? false,
        defaultSetDurationSec: clampExportedDefaultSetDurationSec(
          state.defaultSetDurationSec,
        ),
        exerciseCardShowLastSessionResult:
          state.exerciseCardShowLastSessionResult ?? false,
        exerciseCardShowKcalInHeader:
          state.exerciseCardShowKcalInHeader ?? false,
        exerciseCardShowTotalVolumeInHeader:
          state.exerciseCardShowTotalVolumeInHeader ?? true,
        workoutListShowDaySummary: state.workoutListShowDaySummary ?? true,
      };
    },
    importSnapshot: async (payload: unknown) => {
      if (!isUserProfileExport(payload)) {
        throw new Error("Профиль: некорректная структура данных.");
      }
      const existingRaw = await appStorage.getString(USER_STORAGE_KEY);
      if (existingRaw) {
        let existing: unknown;
        try {
          existing = JSON.parse(existingRaw) as unknown;
        } catch {
          throw new Error(
            "Профиль: в браузере повреждёны данные пользователя — импорт отменён, чтобы не потерять токен входа.",
          );
        }
        if (isZustandPersistBlob(existing) && isPlainObject(existing.state)) {
          const prevState = existing.state as {
            defaultSetDurationSec?: number;
            exerciseCardShowLastSessionResult?: boolean;
            exerciseCardShowKcalInHeader?: boolean;
            exerciseCardShowTotalVolumeInHeader?: boolean;
            workoutListShowDaySummary?: boolean;
          };
          const next = {
            ...existing,
            state: {
              ...existing.state,
              user: payload.user,
              personalData: payload.personalData,
              ringGoals: payload.ringGoals,
              workoutCaloriesEnabled: payload.workoutCaloriesEnabled ?? false,
              defaultSetDurationSec: clampExportedDefaultSetDurationSec(
                payload.defaultSetDurationSec ?? prevState.defaultSetDurationSec,
              ),
              exerciseCardShowLastSessionResult:
                payload.exerciseCardShowLastSessionResult ??
                prevState.exerciseCardShowLastSessionResult ??
                false,
              exerciseCardShowKcalInHeader:
                payload.exerciseCardShowKcalInHeader ??
                prevState.exerciseCardShowKcalInHeader ??
                false,
              exerciseCardShowTotalVolumeInHeader:
                payload.exerciseCardShowTotalVolumeInHeader ??
                prevState.exerciseCardShowTotalVolumeInHeader ??
                true,
              workoutListShowDaySummary:
                payload.workoutListShowDaySummary ??
                prevState.workoutListShowDaySummary ??
                true,
            },
          };
          await writeJsonToStorage(USER_STORAGE_KEY, next);
        } else {
          throw new Error(
            "Профиль: не удалось объединить с текущими данными — сначала восстановите хранилище или выйдите из аккаунта.",
          );
        }
      } else {
        await writeJsonToStorage(USER_STORAGE_KEY, {
          state: {
            user: payload.user,
            personalData: payload.personalData,
            ringGoals: payload.ringGoals,
            workoutCaloriesEnabled: payload.workoutCaloriesEnabled ?? false,
            defaultSetDurationSec: clampExportedDefaultSetDurationSec(
              payload.defaultSetDurationSec,
            ),
            exerciseCardShowLastSessionResult:
              payload.exerciseCardShowLastSessionResult ?? false,
            exerciseCardShowKcalInHeader:
              payload.exerciseCardShowKcalInHeader ?? false,
            exerciseCardShowTotalVolumeInHeader:
              payload.exerciseCardShowTotalVolumeInHeader ?? true,
            workoutListShowDaySummary:
              payload.workoutListShowDaySummary ?? true,
            accessToken: "",
          },
        });
      }
      void useUserStore.persist.rehydrate();
    },
  },
];
