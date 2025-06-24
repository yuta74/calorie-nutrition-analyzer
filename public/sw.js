const CACHE_NAME = 'calorie-analyzer-v1'
const urlsToCache = [
  '/',
  '/profile',
  '/goals', 
  '/calendar',
  '/notifications',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      }
    )
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // バックグラウンド同期の処理
  return fetch('/api/sync')
    .then((response) => response.json())
    .then((data) => {
      // 必要に応じて通知を表示
      if (data.notifications) {
        data.notifications.forEach((notification) => {
          self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icons/icon-192x192.svg',
            badge: '/icons/icon-72x72.svg'
          })
        })
      }
    })
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'アプリを開く',
        icon: '/icons/icon-72x72.svg'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon-72x72.svg'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('カロリー分析アプリ', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // 何もしない
  } else {
    event.waitUntil(clients.openWindow('/'))
  }
})