// Production Service Worker for Iinventive CRM PWA
// Stamped at build time by vite.config.js (SW_VERSION & PRECACHE_ASSETS).

const SW_VERSION = 'dev-v1';
const SHELL_CACHE = `crm-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `crm-runtime-${SW_VERSION}`;
const FONT_CACHE = 'crm-fonts-v1';

const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-96.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/brand-icon.svg'
];

// Never cache API, WebSocket, landing app, or binary bridge downloads
const BYPASS_PREFIXES = ['/api/', '/ws', '/landing/', '/actuator/', '/BusyBridge.zip', '/TallyBridge.zip'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => undefined)
        )
      );
    }).catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => {
            if (key === SHELL_CACHE || key === RUNTIME_CACHE || key === FONT_CACHE) return false;
            return key.startsWith('crm-');
          })
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Cross-origin: only stale-while-revalidate Google Fonts; bypass everything else
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    }
    return;
  }

  // Strictly bypass authenticated APIs, WebSockets, landing pages (/landing & /landing/*), actuator, and bridge downloads
  if (url.pathname === '/landing' || BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return;
  }

  // SPA navigation requests: Network-first, fall back to cached shell /index.html or /offline.html
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Static immutable Vite assets & PWA icons: Cache-first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(SHELL_CACHE)
        .then((cache) => cache.put('/index.html', copy))
        .catch(() => undefined);
    }
    return response;
  } catch {
    const cachedShell = await caches.match('/index.html');
    if (cachedShell) return cachedShell;
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;
    return new Response('Offline — please reconnect.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return new Response('', { status: 504 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// ── Web Push Notifications ───────────────────────────────────────────────────
self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'Iinventive CRM Notification';

    let targetUrl = self.location.origin;
    if (data.type === 'MENTION') {
      if (data.dealId) {
        targetUrl += `/deals?dealId=${data.dealId}&tab=notes`;
      } else if (data.contactId) {
        targetUrl += `/contacts/${data.contactId}?tab=notes`;
      }
    } else if (data.type === 'ACTIVITY_REMINDER' && data.activityId) {
      targetUrl += `/activities?highlight=${data.activityId}`;
    } else if (data.type === 'CHAT_MESSAGE') {
      targetUrl += `/chat?colleagueId=${data.contactId}`;
    } else if (data.ticketId) {
      targetUrl += `/support`;
    }

    const options = {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: {
        url: targetUrl
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error displaying push notification:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.startsWith(self.location.origin) && 'navigate' in client && 'focus' in client) {
          client.focus();
          return client.navigate(urlToOpen).then((c) => c.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
