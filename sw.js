// Service Worker for Spec Interior PWA
const CACHE_NAME = 'spec-interior-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/category.html',
  '/product.html',
  '/checkout.html',
  '/contact.html',
  '/wishlist.html',
  '/favicon.png',
  '/hero-bg.png',
  '/manifest.json',
  '/js/cart.js',
  '/js/products.js',
  '/js/checkout.js',
  '/js/wishlist.js',
  '/js/firebase-config.js',
  '/js/orders.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Some files might fail, that's ok
      });
    })
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('/index.html');
        });
      })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});
