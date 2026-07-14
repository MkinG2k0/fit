import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getLoadTableStorageKey, loadTableStorageApi } from "../api/loadTableApi";
import type {
  LoadTableExercise,
  LoadTableExerciseDraft,
  LoadTableExerciseUpdate,
} from "../model/types";

type LoadTableStatus = "idle" | "error";

interface LoadTableState {
  exercises: LoadTableExercise[];
  status: LoadTableStatus;
  errorMessage: string | null;
}

interface LoadTableActions {
  addExercise: (draft: LoadTableExerciseDraft) => void;
  updateExercise: (id: string, patch: LoadTableExerciseUpdate) => void;
  removeExercise: (id: string) => void;
  /** Включить/выключить подстановку плана при добавлении подхода. */
  setExerciseTracking: (id: string, isTracking: boolean) => void;
  /** Сброс цикла: createdAt = сейчас, счёт недель начинается с 1. */
  resetExerciseProgress: (id: string) => void;
  clearError: () => void;
}

const isPositiveFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
};

const createExerciseId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

const validateDraft = (draft: LoadTableExerciseDraft) => {
  if (draft.catalogExerciseId.trim().length === 0) {
    return "Выберите упражнение";
  }
  if (!isPositiveFiniteNumber(draft.maxKg)) {
    return "Укажите положительный MAX (кг)";
  }
  return null;
};

export const useLoadTableStore = create<LoadTableState & LoadTableActions>()(
  persist(
    (set) => ({
      exercises: [],
      status: "idle",
      errorMessage: null,

      addExercise: (draft) =>
        set((state) => {
          const validationError = validateDraft(draft);
          if (validationError) {
            return {
              ...state,
              status: "error",
              errorMessage: validationError,
            };
          }

          const catalogExerciseId = draft.catalogExerciseId.trim();
          const isDuplicate = state.exercises.some(
            (exercise) => exercise.catalogExerciseId === catalogExerciseId,
          );
          if (isDuplicate) {
            return {
              ...state,
              status: "error",
              errorMessage: "Это упражнение уже добавлено в таблицу нагрузок",
            };
          }

          const newExercise: LoadTableExercise = {
            id: createExerciseId(),
            catalogExerciseId,
            maxKg: draft.maxKg,
            createdAt: new Date().toISOString(),
            isTracking: false,
          };

          return {
            ...state,
            exercises: [...state.exercises, newExercise],
            status: "idle",
            errorMessage: null,
          };
        }),

      updateExercise: (id, patch) =>
        set((state) => {
          const existing = state.exercises.find((exercise) => exercise.id === id);
          if (!existing) {
            return {
              ...state,
              status: "error",
              errorMessage: "Упражнение не найдено",
            };
          }

          const nextMaxKg = patch.maxKg !== undefined ? patch.maxKg : existing.maxKg;

          if (patch.maxKg !== undefined && !isPositiveFiniteNumber(nextMaxKg)) {
            return {
              ...state,
              status: "error",
              errorMessage: "Укажите положительный MAX (кг)",
            };
          }

          return {
            ...state,
            exercises: state.exercises.map((exercise) =>
              exercise.id === id
                ? {
                    ...exercise,
                    maxKg: nextMaxKg,
                  }
                : exercise,
            ),
            status: "idle",
            errorMessage: null,
          };
        }),

      removeExercise: (id) =>
        set((state) => ({
          ...state,
          exercises: state.exercises.filter((exercise) => exercise.id !== id),
          status: "idle",
          errorMessage: null,
        })),

      setExerciseTracking: (id, isTracking) =>
        set((state) => {
          const existing = state.exercises.find((exercise) => exercise.id === id);
          if (!existing) {
            return {
              ...state,
              status: "error",
              errorMessage: "Упражнение не найдено",
            };
          }

          return {
            ...state,
            exercises: state.exercises.map((exercise) =>
              exercise.id === id
                ? {
                    ...exercise,
                    isTracking,
                  }
                : exercise,
            ),
            status: "idle",
            errorMessage: null,
          };
        }),

      resetExerciseProgress: (id) =>
        set((state) => {
          const existing = state.exercises.find((exercise) => exercise.id === id);
          if (!existing) {
            return {
              ...state,
              status: "error",
              errorMessage: "Упражнение не найдено",
            };
          }

          return {
            ...state,
            exercises: state.exercises.map((exercise) =>
              exercise.id === id
                ? {
                    ...exercise,
                    createdAt: new Date().toISOString(),
                  }
                : exercise,
            ),
            status: "idle",
            errorMessage: null,
          };
        }),

      clearError: () =>
        set((state) => ({
          ...state,
          status: "idle",
          errorMessage: null,
        })),
    }),
    {
      name: getLoadTableStorageKey(),
      storage: createJSONStorage(() => loadTableStorageApi),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<LoadTableState> | undefined;
        const exercises = (persistedState?.exercises ?? current.exercises).map(
          (exercise) => ({
            ...exercise,
            isTracking: exercise.isTracking === true,
          }),
        );
        return {
          ...current,
          ...persistedState,
          exercises,
        };
      },
    },
  ),
);
