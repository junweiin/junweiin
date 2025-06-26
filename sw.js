const CACHE_NAME = 'worklog-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/config.js',
  '/js/utils.js',
  '/js/auth.js',
  '/js/base-app.js',
  '/js/modules/main-page.js',
  '/favicon.svg',
  '/aircondition.html',
  'js/modules/aircondition.js',
  // 可根据实际情况添加其它页面和静态资源
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
