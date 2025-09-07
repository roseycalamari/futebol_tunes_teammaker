// Service Worker for NiteRun PWA
const CACHE_NAME = 'niterun-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/login.html',
  '/signup.html',
  '/team-generator.html',
  '/styles.css',
  '/assets/images/logo png.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification!',
    icon: '/assets/images/logo png.png',
    badge: '/assets/images/logo png.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/assets/images/logo png.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/logo png.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NiteRun', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
