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
import type { CalendarDay } from "../model/types";
import { createRandomUuid } from "@/shared/lib";
import { getDaysFromLocalStorage } from "@/shared/lib/storage";
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
  addSetToExercise: (
    exercise: Exercise,
    payload: { weight: number; reps: number; endTime: string },
  ) => string;
  deleteExercise: (exercise: Exercise) => void;
  deleteSet: (exercise: Exercise, exerciseSet: ExerciseSet) => void;
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

  addExercise: (name, group, presetName?, presetColor?, iconId?) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const newExercises = [
        ...oldExercises,
        generateExercise(name, group, presetName, presetColor, iconId),
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
          category: exerciseParams!.group as string,
          ...(exerciseParams?.iconId !== undefined
            ? { iconId: exerciseParams.iconId }
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
}));
