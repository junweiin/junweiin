const CACHE_NAME = 'worklog-cache-v2';
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
  '/powerstation.html',
  '/waterfilter.html',
  '/js/modules/aircondition.js',
  '/js/modules/powerstation.js',
  '/js/modules/waterfilter.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leancloud-storage@4.15.2/dist/av-min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(error => {
        console.error('缓存添加失败:', error);
        // 即使部分资源缓存失败也继续安装
        return Promise.resolve();
      });
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