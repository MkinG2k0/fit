import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { RgbaColor } from "react-colorful";
import { create } from "zustand";
import type { ExerciseOption } from "@/features/exercise";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import type { CalendarDay } from "../model/types";
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
  loadDaysFromLocalStorage: (date: dayjs.Dayjs) => void;
  addExercise: (
    name: string,
    group: string,
    presetName?: string,
    presetColor?: RgbaColor,
  ) => void;
  setExerciseName: (
    exerciseParams: ExerciseOption | null,
    exercise: Exercise,
  ) => void;
  setExerciseValues: (
    value: string,
    type: keyof ExerciseSet,
    id: string,
    exercise: Exercise,
  ) => void;
  addSetToExercise: (exercise: Exercise) => void;
  deleteExercise: (exercise: Exercise) => void;
  deleteSet: (exercise: Exercise, exerciseSet: ExerciseSet) => void;
}

export const useCalendarStore = create<CalendarStore>()((set) => ({
  days: {},
  selectedDate: dayjs(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  observableDate: dayjs(),
  setObservableDate: (date) => set({ observableDate: date }),

  loadDaysFromLocalStorage: (date) =>
    set(() => {
      const days = getDaysFromLocalStorage(date);
      return { days };
    }),

  addExercise: (name, group, presetName?, presetColor?) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      oldExercises.push(generateExercise(name, group, presetName, presetColor));
      const newDays = replaceExercises(
        state.selectedDate,
        state.days,
        dateKey,
        oldExercises,
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
            set.id === id ? { ...set, [type]: Number(value) } : set,
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

  addSetToExercise: (exercise) =>
    set((state) => {
      const { dateKey, oldExercises } = getDateKeyAndOldExercises(
        state.selectedDate,
        state.days,
      );
      const lastSet = exercise.sets[exercise.sets.length - 1] ?? {
        id: 0,
        weight: 0,
        reps: 0,
      };
      const newExercises = oldExercises.map((ex) => {
        if (ex.id !== exercise.id) return ex;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: crypto.randomUUID(),
              weight: lastSet.weight,
              reps: lastSet.reps,
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
}));
