/* ملفات المحقق — offline cache. Version changes whenever the game changes, so players get updates. */
const V='mohaqqiq-eda5c16c53';
const FILES=["./", "index.html", "fonts.css", "manifest.webmanifest", "fonts/arefruqaa-400.woff", "fonts/plexarabic-400.woff", "fonts/plexarabic-500.woff", "fonts/plexarabic-600.woff", "fonts/plexmono-500.woff", "fonts/reemkufi-500.woff", "fonts/reemkufi-700.woff", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r})));
});
