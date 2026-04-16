import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

registerRoute(
  ({ request }) =>
    ["script", "style", "image", "font"].includes(request.destination),
  new CacheFirst({
    cacheName: "static-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin === "https://fit-backend.onrender.com",
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "Fit";
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
