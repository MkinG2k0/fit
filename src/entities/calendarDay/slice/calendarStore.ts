import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { RgbaColor } from "react-colorful";
import { create } from "zustand";
import type { ExerciseOption } from "@/features/exercise";
import type {
  Exercise,
  ExerciseIconId,
  ExerciseSet,
  SetCalories,
} from "@/entities/exercise";
import {
  dayExercisesNeedRemap,
  remapDayExercises,
  type TargetExerciseMeta,
} from "@/entities/exercise/lib/mergeCatalogExercise";
import type { CalendarDay } from "../model/types";
import { createRandomUuid } from "@/shared/lib";
import { getDaysFromLocalStorage, saveDaysToLocalStorage } from "@/shared/lib/storage";
import { useUserStore } from "@/entities/user";
import {
  generateExercise,
  getDateKeyAndOldExercises,
  replaceExercises,
} from "../lib/exerciseHelpers";

dayjs.locale("ru");

interface CalendarStore {
  days: Record<string, CalendarDay>;
  selectedDate: dayjs.Dayjs;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  observableDate: dayjs.Dayjs;
  setObservableDate: (date: dayjs.Dayjs) => void;
  loadDaysFromLocalStorage: (date: dayjs.Dayjs) => Promise<void>;
  addExercise: (
    name: string,
    group: string,
    presetName?: string,
    presetColor?: RgbaColor,
    iconId?: ExerciseIconId,
    catalogExerciseId?: string,
    categoryId?: string,
  ) => void;
  setExerciseName: (
    exerciseParams: ExerciseOption | null,
    exercise: Exercise,
  ) => void;
  setExerciseValues: (
    value: string,
    type: "reps" | "weight",
    id: string,
    exercise: Exercise,
  ) => void;
  applySetCalories: (
    exercise: Exercise,
    setId: string,
    calories: SetCalories,
  ) => void;
  applySetCaloriesBatchByDateKey: (
    dateKey: string,
    patches: Array<{
      exerciseId: string;
      setId: string;
      calories: SetCalories;
    }>,
  ) => void;
  addSetToExercise: (
    exercise: Exercise,
    payload: { weight: number; reps: number; startTime: string; endTime: string },
  ) => string;
  /**
   * Синхронизирует подходы упражнения на выбранном дне с планом (ровно длина sets).
   * Не создаёт новую карточку, если упражнения нет в дне.
   */
  syncExerciseSetsFromPlan: (
    exercise: Exercise,
    sets: Array<{ weight: number; reps: number }>,
  ) => void;
  deleteExercise: (exercise: Exercise) => void;
  deleteSet: (exercise: Exercise, exerciseSet: ExerciseSet) => void;
  /** In-memory remap catalogExerciseId source → target; D-01: две карточки в дне остаются. */
  remapCatalogExerciseId: (
    sourceId: string,
    targetId: string,
    targetMeta?: TargetExerciseMeta,
  ) => void;
}

export const useCalendarStore = create<CalendarStore>()((set) => ({
  days: {},
  selectedDate: dayjs(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  observableDate: dayjs(),
  setObservableDate: (date) => set({ observableDate: date }),

  loadDaysFromLocalStorage: async (date) => {
    const days = await getDaysFromLocalStorage(date);
    set(() => ({ days }));
  },

  addExercise: (
    name,
    group,
    presetName?,
    presetColor?,
    iconId?,
    catalogExerciseId?,
    categoryId?,
  ) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const workoutCaloriesEnabled =
        useUserStore.getState().workoutCaloriesEnabled ?? false;
      const newExercises = [
        ...oldExercises,
        generateExercise(
          name,
          group,
          presetName,
          presetColor,
          iconId,
          catalogExerciseId,
          categoryId,
          {
          singleEmptySet: !workoutCaloriesEnabled,
          },
        ),
      ];
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  setExerciseName: (exerciseParams, exercise) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          name: exerciseParams!.name,
          ...(exerciseParams?.categoryId
            ? { categoryId: exerciseParams.categoryId }
            : {}),
          ...(exerciseParams?.iconId !== undefined
            ? { iconId: exerciseParams.iconId }
            : {}),
          ...(exerciseParams?.catalogExerciseId
            ? { catalogExerciseId: exerciseParams.catalogExerciseId }
            : {}),
        };
      });
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  setExerciseValues: (value, type, id, exercise) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) =>
            set.id === id
              ? {
                  ...set,
                  [type]: Number(value),
                  calories: undefined,
                }
              : set,
          ),
        };
      });
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  applySetCalories: (exercise, setId, calories) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) =>
            set.id === setId ? { ...set, calories } : set,
          ),
        };
      });
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  applySetCaloriesBatchByDateKey: (dateKey, patches) =>
    set((state) => {
      if (patches.length === 0) {
        return state;
      }

      const day = state.days[dateKey];
      if (!day || day.exercises.length === 0) {
        return state;
      }

      const patchMap = new Map<string, SetCalories>();
      for (const patch of patches) {
        patchMap.set(`${patch.exerciseId}:${patch.setId}`, patch.calories);
      }

      let isChanged = false;
      const newExercises = day.exercises.map((exerciseItem) => {
        let exerciseChanged = false;
        const newSets = exerciseItem.sets.map((setItem) => {
          const calories = patchMap.get(`${exerciseItem.id}:${setItem.id}`);
          if (!calories) {
            return setItem;
          }
          exerciseChanged = true;
          return { ...setItem, calories };
        });

        if (!exerciseChanged) {
          return exerciseItem;
        }

        isChanged = true;
        return {
          ...exerciseItem,
          sets: newSets,
        };
      });

      if (!isChanged) {
        return state;
      }

      const newDays = {
        ...state.days,
        [dateKey]: {
          ...day,
          exercises: newExercises,
        },
      };
      void saveDaysToLocalStorage(state.selectedDate, newDays);
      return { days: newDays };
    }),

  addSetToExercise: (exercise, payload) => {
    const newSetId = createRandomUuid();
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: newSetId,
              weight: payload.weight,
              reps: payload.reps,
              startTime: payload.startTime,
              endTime: payload.endTime,
            },
          ],
        };
      });
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    });
    return newSetId;
  },

  syncExerciseSetsFromPlan: (exercise, sets) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const targetExists = oldExercises.some((ex) => ex.id === exercise.id);
      if (!targetExists) {
        return state;
      }

      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;

        const nextSets: ExerciseSet[] = sets.map((planSet, index) => {
          const existing = ex.sets[index];
          if (existing) {
            return {
              ...existing,
              weight: planSet.weight,
              reps: planSet.reps,
              calories: undefined,
            };
          }
          return {
            id: createRandomUuid(),
            weight: planSet.weight,
            reps: planSet.reps,
          };
        });

        return {
          ...ex,
          sets: nextSets,
        };
      });

      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  deleteExercise: (exercise) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.filter((ex) => ex.id !== exercise.id);
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  deleteSet: (exercise, exerciseSet) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          sets: ex.sets.filter((set) => set.id !== exerciseSet.id),
        };
      });
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        newExercises,
      );
      return { days: newDays };
    }),

  remapCatalogExerciseId: (sourceId, targetId, targetMeta) =>
    set((state) => {
      if (!sourceId || !targetId || sourceId === targetId) {
        return state;
      }

      let isChanged = false;
      const newDays: Record<string, CalendarDay> = {};
      const affectedMonthKeys = new Set<string>();

      for (const [dateKey, day] of Object.entries(state.days)) {
        const exercises = day.exercises ?? [];
        if (!dayExercisesNeedRemap(exercises, sourceId)) {
          newDays[dateKey] = day;
          continue;
        }

        isChanged = true;
        newDays[dateKey] = {
          ...day,
          exercises: remapDayExercises(
            exercises,
            sourceId,
            targetId,
            targetMeta,
          ),
        };

        const monthParts = dateKey.split("-");
        if (monthParts.length === 3) {
          affectedMonthKeys.add(`${monthParts[1]}-${monthParts[2]}`);
        }
      }

      if (!isChanged) {
        return state;
      }

      for (const monthKey of affectedMonthKeys) {
        const [month, year] = monthKey.split("-");
        const monthDate = dayjs(`${year}-${month}-01`);
        if (monthDate.isValid()) {
          void saveDaysToLocalStorage(monthDate, newDays);
        }
      }

      return { days: newDays };
    }),
}));
