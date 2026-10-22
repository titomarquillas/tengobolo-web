// TengoBolo service worker: la web funciona sin conexión para lo básico.
// Nunca guarda llamadas a la API (datos siempre en vivo).
const V = 'tb-v34';
const SHELL = ['/', '/artistas.html', '/logo-heart-b.png', '/logo-heart-b-sm.png', '/hero.jpg', '/icon-192.png', '/icon-512.png', '/manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (u.pathname === '/') { const cp = res.clone(); caches.open(V).then(c => c.put('/', cp)); } return res; }).catch(() => caches.match(r).then(m => m || caches.match('/'))));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
});
