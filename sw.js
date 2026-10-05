// Service worker: receives parent push notifications.
// Paths are relative to where the app lives (the site root, or /jaylene/ on GitHub Pages).
const here = (p) => new URL(String(p || "").replace(/^\//, ""), self.registration.scope).href;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "Truant Detector", body: event.data?.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || "Truant Detector", {
      body: data.body || "",
      tag: data.tag,
      renotify: true,
      icon: here("icon-192.png"),
      badge: here("icon-192.png"),
      data: { url: here(data.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || here("");
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) { open.navigate(url); return open.focus(); }
      return self.clients.openWindow(url);
    }),
  );
});
