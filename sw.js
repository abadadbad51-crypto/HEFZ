// ====================================================
// Service Worker — حفظ (HEFZ)
// ====================================================
const CACHE_NAME = 'hefz-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/db.js',
  '/js/lang.js',
  '/js/security.js',
  '/js/notifications.js',
  '/js/helpers.js',
  '/js/app.js',
  '/js/auth.js',
  '/js/pages-admin.js',
  '/js/pages-teacher.js',
  '/js/pages-parent.js',
  '/assets/logo-hifz-mark.png',
  '/assets/logo-hifz-lockup.png',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700;900&display=swap',
];

// ── تثبيت: تخزين الأصول الثابتة ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] بعض الملفات لم تُحمَّل في الـ cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── تفعيل: حذف الـ cache القديم ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── الاعتراض: Cache-first للأصول الثابتة، Network-first للبيانات ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // تجاهل طلبات Firebase / Google APIs
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('gstatic') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // استراتيجية: Cache-first مع تحديث في الخلفية
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached); // إذا انقطع الإنترنت، استخدم الـ cache

      return cached || fetchPromise;
    })
  );
});

// ── استقبال رسائل Push (مستقبلاً مع FCM) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json().catch(() => ({ title: '🔔 حفظ', body: '' }));
  event.waitUntil(
    self.registration.showNotification(data.title || '🔔 حفظ', {
      body: data.body || '',
      icon: '/assets/logo-hifz-mark.png',
      badge: '/assets/logo-hifz-mark.png',
      dir: 'rtl',
      lang: 'ar',
      tag: 'hefz-push',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
