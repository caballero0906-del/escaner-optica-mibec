const CACHE_NAME = "mibec-escaner-v2";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const nombres = await caches.keys();

      await Promise.all(
        nombres
          .filter(nombre =>
            nombre.startsWith("mibec-escaner-") &&
            nombre !== CACHE_NAME
          )
          .map(nombre => caches.delete(nombre))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const respuesta = await fetch(event.request);

        if (respuesta.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, respuesta.clone());
        }

        return respuesta;
      } catch (error) {
        const guardado = await caches.match(event.request);

        if (guardado) return guardado;

        throw error;
      }
    })()
  );
});
