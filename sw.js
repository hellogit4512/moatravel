/* 모아여행 오프라인 지원
 * - 화면(HTML)은 인터넷 먼저, 안 되면 저장해둔 것
 * - 앱 파일·글꼴·라이브러리는 저장해둔 것 먼저 (주소에 버전이 붙어 있어 바뀌면 새로 받음)
 * - 공유방 사진은 한 번 본 것은 기기에 보관 (사진 번호마다 내용이 바뀌지 않음)
 * - 여행방 데이터·지도 타일·지도 SDK는 저장하지 않음 (여행방 데이터는 앱이 기기에 따로 보관)
 */
const SHELL = 'moa-shell-v1';
const PHOTOS = 'moa-photos-v1';
const PRE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![SHELL, PHOTOS].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const STATIC_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 공유방 사진: 한 번 받은 건 기기에서
  if (/\/rooms\/[a-z0-9]+\/photos\/[a-z0-9]+$/.test(url.pathname)) {
    e.respondWith(caches.open(PHOTOS).then(async (c) => {
      const key = url.origin + url.pathname;
      const hit = await c.match(key);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(key, res.clone());
      return res;
    }));
    return;
  }

  // 화면: 인터넷 먼저
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req.url, { cache: 'no-cache' }).then((res) => { caches.open(SHELL).then((c) => c.put('index.html', res.clone())); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }

  // 내 앱 파일과 CDN 글꼴·라이브러리: 저장해둔 것 먼저
  const mine = url.origin === location.origin;
  if (mine || STATIC_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open(SHELL).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
