import { useRestTimerStore } from "../slice/restTimerStore";
import { notifyTimerComplete } from "./notifications";
import { cancelRestTimerNotification } from "./restTimerLocalNotification";

/** Prevents double notify when both page timer and global watcher fire. */
let claimedEndAt: number | null = null;

/** OS already delivered the rest-complete banner — clear without Web Audio. */
export const acknowledgeRestTimerOsDelivery = (
  endAt: number | null,
): void => {
  if (typeof endAt === "number" && Number.isFinite(endAt)) {
    claimedEndAt = endAt;
  }
  useRestTimerStore.getState().clear();
};

/** Sound + vibrate + notification, then clear store. Idempotent per `endAt`. */
export const completeRestTimer = (endAt: number): boolean => {
  void cancelRestTimerNotification();
  if (claimedEndAt === endAt) {
    return false;
  }
  claimedEndAt = endAt;
  notifyTimerComplete();
  useRestTimerStore.getState().clear();
  return true;
};
