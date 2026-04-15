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
}

interface ActionsState {
  addUserData: (user: IUser) => void;
  setPersonalData: (param: IUserPersonalData) => void;
  setRingGoals: (ringGoals: RingGoalsSettings) => void;
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

