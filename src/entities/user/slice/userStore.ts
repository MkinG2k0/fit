import { create } from "zustand";
import type { IUser, IUserPersonalData } from "../model/types";
import { persist } from "zustand/middleware";

interface UserState {
  user: IUser;
  accessToken: string;
  personalData: IUserPersonalData;
}

interface ActionsState {
  addUserData: (user: IUser) => void;
  setPersonalData: (param: IUserPersonalData) => void;
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

