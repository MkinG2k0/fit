export const playNotificationSound = () => {
  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 1,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);
};

export const sendPushNotification = async () => {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.active?.postMessage({
            type: "SHOW_NOTIFICATION",
            title: "Таймер завершен!",
            body: "Ваш таймер MagFitDiary завершился. Время для следующего упражнения!",
            url: "/timer",
          });
        }
      }
    } catch (error) {
      console.error("Ошибка при отправке push-уведомления:", error);
    }
  }
};

