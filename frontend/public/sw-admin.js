// Service Worker strictly scoped for the Admin Dashboard (/admin)
const CACHE_NAME = 'admin-dashboard-v1';
const CORE_ASSETS = [
  '/manifest-admin.json',
  '/icons/admin-icon.svg',
  '/icons/admin-icon-192.png',
  '/icons/admin-icon-512.png',
  '/icons/admin-icon-maskable.png',
];

// Install: Cache critical admin shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy for admin pages and API calls, cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly ignore requests outside the admin scope or public site assets
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/icons/') && url.pathname !== '/manifest-admin.json') {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If valid response and matches admin static resources, update cache in background
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith('/icons/') || url.pathname.includes('/_next/static/'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline fallback
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's a page navigation inside /admin, return cached admin home or fallback
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/admin');
          if (fallback) return fallback;
        }

        return new Response(
          `<!DOCTYPE html>
          <html lang="ar" dir="rtl">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <title>غير متصل بالإنترنت | لوحة التحكم</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #171717; color: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 20px; }
                .box { max-width: 420px; background: #262626; padding: 32px 24px; border-radius: 20px; border: 1px solid #404040; }
                h1 { color: #f59e0b; font-size: 20px; margin-bottom: 12px; }
                p { color: #a3a3a3; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
                button { background: #d97706; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 9999px; cursor: pointer; }
                button:hover { background: #b45309; }
              </style>
            </head>
            <body>
              <div class="box">
                <h1>لا يوجد اتصال بالإنترنت</h1>
                <p>أنت حالياً غير متصل بالإنترنت. يرجى التحقق من اتصالك للوصول إلى لوحة تحكم الخاصة بك وتحديث البيانات.</p>
                <button onclick="window.location.reload()">إعادة المحاولة</button>
              </div>
            </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      })
  );
});
