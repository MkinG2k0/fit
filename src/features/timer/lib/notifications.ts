import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useUserStore } from "@/entities/user";

const VIBRATE_PATTERN = [200, 100, 200, 100, 400];

const areTimerNotificationsEnabled = (): boolean =>
  useUserStore.getState().timerCompleteNotificationsEnabled ?? true;

export const vibrateDevice = () => {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }
  try {
    navigator.vibrate(VIBRATE_PATTERN);
  } catch (error) {
    console.error("Ошибка вибрации:", error);
  }
};

export const playNotificationSound = () => {
  try {
    const volume = useUserStore.getState().timerNotificationVolume ?? 1;
    const peak = Math.max(0.0001, 0.35 * volume);
    const audioContext = new window.AudioContext();
    const playBeep = (startAt: number, frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.exponentialRampToValueAtTime(peak, startAt + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    };

    void audioContext.resume().then(() => {
      const now = audioContext.currentTime;
      playBeep(now, 880, 0.25);
      playBeep(now + 0.35, 880, 0.25);
      playBeep(now + 0.7, 1175, 0.45);
    });
  } catch (error) {
    console.error("Ошибка воспроизведения звука:", error);
  }
};

const showLocalNotification = (title: string, body: string, url: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/logo.png",
    badge: "/logo.png",
    tag: "timer-complete",
    requireInteraction: true,
    // Chrome Android supports vibration on Notification options
    vibrate: VIBRATE_PATTERN,
    data: { url },
  } as NotificationOptions);

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

export const sendPushNotification = async () => {
  if (!("Notification" in window)) {
    return;
  }

  try {
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;

    if (permission !== "granted") {
      return;
    }

    const title = "Таймер завершен!";
    const body = "Ваш таймер Fit завершился. Время для следующего упражнения!";
    const url = "/timer";

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        registration.active.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
          url,
          vibrate: VIBRATE_PATTERN,
        });
        return;
      }
    }

    showLocalNotification(title, body, url);
  } catch (error) {
    console.error("Ошибка при отправке уведомления:", error);
  }
};

/** Call on Start (user gesture) so permission prompt is allowed. */
export const ensureNotificationPermission = () => {
  if (!areTimerNotificationsEnabled()) {
    return;
  }
  if (Capacitor.isNativePlatform()) {
    void LocalNotifications.requestPermissions().catch((error) => {
      console.error("Не удалось запросить разрешение на уведомления:", error);
    });
    return;
  }
  if (!("Notification" in window)) {
    return;
  }
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
};

export const notifyTimerComplete = () => {
  if (!areTimerNotificationsEnabled()) {
    return;
  }
  vibrateDevice();
  playNotificationSound();
  void sendPushNotification();
};
