self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "MagFitDiary";
  const options = {
    body: data.body,
    icon: "/logo.svg",
    badge: "/logo.svg",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, url } = event.data;

    const options = {
      body: body,
      icon: "/logo.svg",
      badge: "/logo.svg",
      data: url || "/",
      tag: "timer-complete",
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

