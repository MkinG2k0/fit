// @ts-ignore
import { registerSW } from "virtual:pwa-register";

export const registerServiceWorker = () => {
  registerSW({
    onNeedRefresh() {
      if (confirm("Обновить приложение до новой версии?")) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log("PWA готово к офлайн-работе 💪");
    },
  });
};

