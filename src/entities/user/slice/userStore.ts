import { create } from "zustand";
import type { IUser, IUserPersonalData } from "../model/types";
import { persist } from "zustand/middleware";
import {
  DEFAULT_RING_GOALS,
  type RingGoalsSettings,
} from "../model/ringGoals";

interface UserState {
  user: IUser;
  accessToken: string;
  personalData: IUserPersonalData;
  ringGoals: RingGoalsSettings;
  /** Фича: ккал на подход (Health / пульс). По умолчанию выкл. */
  workoutCaloriesEnabled: boolean;
}

interface ActionsState {
  addUserData: (user: IUser) => void;
  setPersonalData: (param: IUserPersonalData) => void;
  setRingGoals: (ringGoals: RingGoalsSettings) => void;
  setWorkoutCaloriesEnabled: (enabled: boolean) => void;
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
      accessToken: "",

      setAccessToken: (token) => set({ accessToken: token }),

      addUserData: (userData) =>
        set(() => ({
          user: userData,
        })),

      setPersonalData: (param) =>
        set((state) => ({
          personalData: {
            ...state.personalData,
            ...param,
          },
        })),

      setRingGoals: (ringGoals) =>
        set(() => ({
          ringGoals,
        })),

      setWorkoutCaloriesEnabled: (enabled) =>
        set(() => ({
          workoutCaloriesEnabled: enabled,
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
    },
  ),
);

