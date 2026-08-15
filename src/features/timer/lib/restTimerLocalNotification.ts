import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useUserStore } from "@/entities/user";
import { useRestTimerStore } from "../slice/restTimerStore";
import {
  acknowledgeRestTimerOsDelivery,
  completeRestTimer,
} from "./completeRestTimer";

export const REST_TIMER_NOTIFICATION_ID = 710015;
/** v2: Android cannot change sound on an already-created channel. */
export const REST_TIMER_CHANNEL_ID = "rest-timer-complete-v2";
const LEGACY_REST_TIMER_CHANNEL_ID = "rest-timer-complete";
const REST_TIMER_CHANNEL_SOUND = "rest_timer_complete.wav";

let restTimerChannelEnsured = false;

export const isNativeTimerPlatform = (): boolean =>
  Capacitor.isNativePlatform();

const areRestTimerNotificationsEnabled = (): boolean =>
  useUserStore.getState().timerCompleteNotificationsEnabled ?? true;

export const ensureRestTimerCompleteChannel = async (): Promise<void> => {
  if (!isNativeTimerPlatform() || Capacitor.getPlatform() !== "android") {
    return;
  }
  if (restTimerChannelEnsured) {
    return;
  }
  try {
    await LocalNotifications.deleteChannel({
      id: LEGACY_REST_TIMER_CHANNEL_ID,
    }).catch(() => undefined);
    await LocalNotifications.createChannel({
      id: REST_TIMER_CHANNEL_ID,
      name: "Таймер отдыха",
      sound: REST_TIMER_CHANNEL_SOUND,
      importance: 4,
      visibility: 1,
      vibration: true,
    });
    restTimerChannelEnsured = true;
  } catch (error) {
    console.error("Не удалось создать канал уведомлений таймера отдыха:", error);
  }
};

export const cancelRestTimerNotification = async (): Promise<void> => {
  if (!isNativeTimerPlatform()) {
    return;
  }
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: REST_TIMER_NOTIFICATION_ID }],
    });
  } catch (error) {
    console.error("Не удалось отменить уведомление таймера отдыха:", error);
  }
};

export const scheduleRestTimerNotification = async (
  endAt: number,
): Promise<void> => {
  if (!isNativeTimerPlatform()) {
    return;
  }
  if (!areRestTimerNotificationsEnabled()) {
    return;
  }
  if (!Number.isFinite(endAt) || endAt <= Date.now()) {
    return;
  }

  await ensureRestTimerCompleteChannel();
  await cancelRestTimerNotification();

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_TIMER_NOTIFICATION_ID,
          title: "Таймер завершен!",
          body: "Время для следующего подхода",
          extra: { endAt },
          channelId: REST_TIMER_CHANNEL_ID,
          sound: REST_TIMER_CHANNEL_SOUND,
          autoCancel: true,
          schedule: { at: new Date(endAt) },
        },
      ],
    });
  } catch (error) {
    console.error("Не удалось запланировать уведомление таймера отдыха:", error);
  }
};

export const syncRestTimerNativeAlarm = async (
  endAt: number | null,
): Promise<void> => {
  if (
    !isNativeTimerPlatform() ||
    endAt == null ||
    !areRestTimerNotificationsEnabled() ||
    !Number.isFinite(endAt) ||
    endAt <= Date.now()
  ) {
    await cancelRestTimerNotification();
    return;
  }
  await scheduleRestTimerNotification(endAt);
};

export const reconcileRestTimerOnAppActive = async (): Promise<void> => {
  if (!isNativeTimerPlatform()) {
    return;
  }

  try {
    const delivered = await LocalNotifications.getDeliveredNotifications();
    const ours = delivered.notifications.filter(
      (notification) => notification.id === REST_TIMER_NOTIFICATION_ID,
    );
    if (ours.length > 0) {
      try {
        await LocalNotifications.removeDeliveredNotifications({
          notifications: ours,
        });
      } catch (error) {
        console.error(
          "Не удалось снять доставленное уведомление таймера отдыха:",
          error,
        );
      }
      acknowledgeRestTimerOsDelivery(useRestTimerStore.getState().endAt);
      return;
    }
  } catch (error) {
    console.error(
      "Не удалось прочитать доставленные уведомления таймера отдыха:",
      error,
    );
  }

  const endAt = useRestTimerStore.getState().endAt;
  if (typeof endAt === "number" && Number.isFinite(endAt) && endAt <= Date.now()) {
    completeRestTimer(endAt);
    return;
  }
  if (typeof endAt === "number" && Number.isFinite(endAt) && endAt > Date.now()) {
    void syncRestTimerNativeAlarm(endAt);
  }
};
