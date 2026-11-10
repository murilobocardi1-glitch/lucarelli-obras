/* Diario Lucarelli: guarda a casca do app para abrir rapido e sem sinal. O envio de dados nao passa por aqui. */
const V = 'diario-v12';
const CASCA = ['./', 'index.html', 'manifest.webmanifest', 'logo.png', 'logo-branca.png', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  /* abre na hora com a copia guardada e atualiza em segundo plano (a versao nova vale na proxima abertura) */
  e.respondWith(caches.open(V).then(c => c.match(r).then(m => {
    const rede = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
    if (m) { rede.catch(() => {}); return m; }
    return rede.catch(() => c.match('index.html'));
  })));
});
