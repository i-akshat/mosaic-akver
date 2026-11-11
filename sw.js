const CACHE_PREFIX = 'mosaic-static-v';
const CACHE_NAME = `${CACHE_PREFIX}49`;
const SHELL = ['./', './index.html', './manifest.webmanifest', './mosaic.css', './icon.svg', './favicon-32.png', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './scripts/app-core.js', './scripts/library-storage.js', './scripts/accessibility-privacy.js', './scripts/profile-onboarding.js', './scripts/audio-tracks-metadata.js', './scripts/guided-tour.js', './scripts/reels-experience.js', './scripts/app-polish.js', './scripts/motion-performance.js', './scripts/profiles-library.js', './scripts/service-worker-register.js', './scripts/reels-community.js', './scripts/player-menus.js', './scripts/local-finishing.js', './scripts/system-check.js', './scripts/localization.js', './scripts/player-accessibility.js', './scripts/player-media-shapes.js', './scripts/player-layouts.js', './scripts/app-final-logic.js', './scripts/art-direction.js', './scripts/artwork.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('./index.html'))));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});





