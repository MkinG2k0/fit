export type { IUser, IUserPersonalData } from "./model/types";
export {
  DEFAULT_RING_GOALS,
  MIN_RING_GOAL_VALUE,
  type RingGoalsSettings,
} from "./model/ringGoals";
export { useUserStore } from "./slice/userStore";
export * from "./api/userApi";

