self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler (required for PWA installability).
self.addEventListener('fetch', () => {
  // Let the browser handle requests normally.
});