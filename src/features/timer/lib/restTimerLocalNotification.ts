import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useUserStore } from "@/entities/user";

export const REST_TIMER_NOTIFICATION_ID = 710015;
export const REST_TIMER_CHANNEL_ID = "rest-timer-complete";

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
    await LocalNotifications.createChannel({
      id: REST_TIMER_CHANNEL_ID,
      name: "Таймер отдыха",
      importance: 4,
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
