importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js"
);

if (self.workbox) {
  const {
    precaching,
    routing,
    strategies,
    backgroundSync,
    cacheableResponse,
    expiration,
    core,
  } = self.workbox;

  core.setCacheNameDetails({ prefix: "litenkod", suffix: "v1" });
  core.skipWaiting();
  core.clientsClaim();

  const manifestEntries = self.__WB_MANIFEST;

  const precacheManifest = Array.isArray(manifestEntries)
    ? manifestEntries
    : [];

  if (!Array.isArray(manifestEntries)) {
    console.warn(
      "Workbox precache manifest missing or invalid; skipping precache population."
    );
  }

  precaching.precacheAndRoute(precacheManifest);
  precaching.cleanupOutdatedCaches();

  const offlineFallbackPage = "/offline.html";
  const imageFallback = "/images/fallback.png";

  const navigationHandler = new strategies.NetworkFirst({
    cacheName: "litenkod-pages",
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  });

  routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    async (options) => {
      try {
        return await navigationHandler.handle(options);
      } catch (error) {
        return precaching.matchPrecache(offlineFallbackPage);
      }
    }
  );

  routing.registerRoute(
    ({ request }) =>
      request.destination === "style" || request.destination === "script",
    new strategies.StaleWhileRevalidate({
      cacheName: "litenkod-static-assets",
    })
  );

  routing.registerRoute(
    ({ request }) => request.destination === "font",
    new strategies.CacheFirst({
      cacheName: "litenkod-fonts",
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  routing.registerRoute(
    ({ request }) => request.destination === "image",
    new strategies.StaleWhileRevalidate({
      cacheName: "litenkod-images",
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  routing.registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith("/api/") && request.method === "GET",
    new strategies.NetworkFirst({
      cacheName: "litenkod-api",
      networkTimeoutSeconds: 3,
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 10,
        }),
      ],
    })
  );

  const bgSyncPlugin = new backgroundSync.BackgroundSyncPlugin("post-queue", {
    maxRetentionTime: 24 * 60,
  });

  routing.registerRoute(
    ({ url, request }) =>
      url.pathname === "/api/submit" && request.method === "POST",
    new strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    "POST"
  );

  routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === "document") {
      const cachedPage = await precaching.matchPrecache(offlineFallbackPage);
      if (cachedPage) {
        return cachedPage;
      }
      return Response.redirect(offlineFallbackPage, 302);
    }

    if (event.request.destination === "image") {
      const cachedImage = await precaching.matchPrecache(imageFallback);
      if (cachedImage) {
        return cachedImage;
      }
      return Response.error();
    }

    return Response.error();
  });
} else {
  console.warn("Workbox failed to load");
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
