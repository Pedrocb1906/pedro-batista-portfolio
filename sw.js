const CACHE = 'pedro-batista-portfolio-v3';
const CORE = [
  './',
  './index.html',
  './styles.css?v=2',
  './app.js?v=2',
  './manifest.webmanifest',
  './assets/images/icon.svg',
  './assets/images/og-image.jpg',
  './assets/slides/slide-01.webp',
  './assets/slides/slide-02.webp',
  './assets/slides/slide-03.webp',
  './assets/slides/slide-04.webp',
  './assets/slides/slide-05.webp',
  './assets/slides/slide-06.webp',
  './assets/slides/slide-07.webp',
  './assets/slides/slide-08.webp',
  './assets/slides/slide-09.webp',
  './assets/slides/slide-10.webp',
  './assets/cv/cv-page-1.webp',
  './assets/cv/cv-page-2.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (!response || response.status !== 200 || response.type === 'opaque') return response;
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
