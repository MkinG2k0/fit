import { useRestTimerStore } from "../slice/restTimerStore";
import { notifyTimerComplete } from "./notifications";

/** Prevents double notify when both page timer and global watcher fire. */
let claimedEndAt: number | null = null;

/** Sound + vibrate + notification, then clear store. Idempotent per `endAt`. */
export const completeRestTimer = (endAt: number): boolean => {
  if (claimedEndAt === endAt) {
    return false;
  }
  claimedEndAt = endAt;
  notifyTimerComplete();
  useRestTimerStore.getState().clear();
  return true;
};
