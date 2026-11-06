/* 모아여행 v3 — 함께 모아 만드는 우리 여행
 * 정적 웹앱. 데이터는 기기에 저장하고, 공유 링크(압축)로 서로 합칩니다.
 * 지도: 국내 = 카카오맵, 해외 = 구글맵 (키가 없으면 OpenStreetMap) */
'use strict';

// ───────── 상수 ─────────
const KEY = 'moa.v2';
const COLORS = ['#0fa37a', '#ff6a47', '#3b82f6', '#f2a100', '#8b5cf6', '#14b8a6', '#ec4899', '#64748b', '#84cc16', '#0ea5e9'];
const TONES = [['#0fa37a', '#ffffff'], ['#ff6a47', '#ffffff'], ['#3b82f6', '#ffffff'], ['#ffc53d', '#3a2b00'], ['#8b5cf6', '#ffffff'], ['#14b8a6', '#ffffff'], ['#ec4899', '#ffffff'], ['#1f2a26', '#e9f1ed']];
const CATS = [
  { k: 'spot', n: '명소', c: '#0fa37a' }, { k: 'food', n: '맛집', c: '#ff6a47' }, { k: 'cafe', n: '카페', c: '#c2803d' },
  { k: 'stay', n: '숙소', c: '#3b82f6' }, { k: 'shop', n: '쇼핑', c: '#8b5cf6' }, { k: 'etc', n: '기타', c: '#94a3b8' },
];
const ECATS = [
  { k: 'food', n: '식비', c: '#ff6a47' }, { k: 'move', n: '교통', c: '#3b82f6' }, { k: 'stay', n: '숙박', c: '#0fa37a' },
  { k: 'play', n: '관광', c: '#f2a100' }, { k: 'shop', n: '쇼핑', c: '#8b5cf6' }, { k: 'etc', n: '기타', c: '#94a3b8' },
];
const MOODS = ['😆', '🥰', '😌', '🤤', '😴', '🥲'];
const TABS = [
  { k: 'places', n: '모아둔 곳', i: 'pin' }, { k: 'plan', n: '우리 일정', i: 'cal' }, { k: 'chat', n: '대화', i: 'chat' },
  { k: 'money', n: '정산', i: 'wallet' }, { k: 'docs', n: '티켓·서류', i: 'ticket' }, { k: 'pack', n: '준비물', i: 'checks' }, { k: 'journal', n: '여행 기록', i: 'camera' },
  { k: 'room', n: '여행방 설정', i: 'sliders' },
];
const BNAV = ['places', 'plan', 'chat', 'money'];
const PACK_TEMPLATE = ['신분증 · 여권', '충전기 · 보조배터리', '세면도구', '상비약', '선크림', '갈아입을 옷', '우산', '멀티탭'];
const KR = /한국|대한민국|국내|서울|부산|제주|강릉|속초|양양|경주|전주|여수|순천|대전|대구|인천|광주|울산|수원|춘천|가평|남해|통영|거제|포항|목포|군산|강원|경기|충청|충북|충남|전라|전북|전남|경상|경북|경남|청주|안동|단양|태안|서산|보령|울릉|독도|평창|홍천|용인|파주|seoul|busan|jeju|korea|gangneung/i;

// ───────── 아이콘 ─────────
const ICONS = {
  chat: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="13.5" rx="2.5"/><path d="M3.5 10h17M15.5 14.5h2"/>',
  checks: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M3.5 6.5l1.5 1.5 2.5-3M3.5 12l1.5 1.5 2.5-3M3.5 17.5l1.5 1.5 2.5-3"/>',
  camera: '<path d="M4 8.5h3l1.8-2.5h6.4L17 8.5h3v11H4z"/><circle cx="12" cy="13.5" r="3.3"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<path d="M12 14.5V3.5M7.5 8L12 3.5 16.5 8"/><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  map: '<path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
  list: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12"/><circle cx="4.5" cy="6.5" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="17.5" r=".6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  up: '<path d="M6.5 14.5l5.5-5.5 5.5 5.5"/>',
  down: '<path d="M6.5 9.5l5.5 5.5 5.5-5.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  more: '<circle cx="5.5" cy="12" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="18.5" cy="12" r="1.1" fill="currentColor"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
  route: '<circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="5.5" r="2"/><path d="M8 18.5h8.5a3.25 3.25 0 0 0 0-6.5h-9a3.25 3.25 0 0 1 0-6.5H16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 13h9l1-13M9.5 7V4.5h5V7"/>',
  home: '<path d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z"/>',
  down2: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
  upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  ext: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  nav: '<path d="M4 11l16-7-7 16-2-7z"/>',
  drag: '<circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  ticket: '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2.2"/>',
  clip: '<path d="M19.5 11.5l-7.6 7.6a4.8 4.8 0 0 1-6.8-6.8l8-8a3.2 3.2 0 0 1 4.6 4.6l-8 8a1.6 1.6 0 0 1-2.3-2.3l7.3-7.3"/>',
};
const I = (n, s = 18, sw = 1.7) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// ───────── 상태 ─────────
let S = load();
const ui = { filter: 'all', sort: 'new', view: 'list', openCmt: {}, q: '' };
const failed = {};
let mapCtl = null;

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.rooms) return { keys: {}, ...s }; } catch (e) { /* noop */ }
  return { rooms: {}, me: {}, theme: 'auto', keys: {} };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('저장 공간이 부족해요. 사진을 줄여주세요.'); }
}

// ───────── 유틸 ─────────
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const now = () => Date.now();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = encodeURIComponent;
const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';
const cat = (k) => CATS.find((c) => c.k === k) || CATS[5];
const ecat = (k) => ECATS.find((c) => c.k === k) || ECATS[5];
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d; };
const WD = '일월화수목금토';
const dayLabel = (r, n) => { const d = addDays(r.start, n - 1); return `${d.getMonth() + 1}.${pad(d.getDate())} ${WD[d.getDay()]}`; };
const dayCount = (r) => Math.min(30, Math.max(1, Math.round((new Date(r.end) - new Date(r.start)) / 864e5) + 1 || 1));
const range = (r) => `${+r.start.slice(5, 7)}.${r.start.slice(8)} – ${+r.end.slice(5, 7)}.${r.end.slice(8)}`;
const nights = (r) => { const d = dayCount(r); return d === 1 ? '당일' : `${d - 1}박 ${d}일`; };
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const tone = (r) => TONES[r.tone ?? hash(r.id) % TONES.length];
const toneStyle = (r) => `--tone:${tone(r)[0]};--tone-fg:${tone(r)[1]}`;
const isWide = () => matchMedia('(min-width:1181px)').matches;
function timeAgo(t) {
  const s = (now() - t) / 1000;
  if (s < 60) return '방금';
  if (s < 3600) return Math.floor(s / 60) + '분 전';
  if (s < 86400) return Math.floor(s / 3600) + '시간 전';
  const d = new Date(t); return `${d.getMonth() + 1}.${d.getDate()}`;
}
const hm = (t) => { const d = new Date(t); return `${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`; };
function dday(r) {
  const today = new Date(isoDate(new Date()) + 'T00:00:00');
  const s = new Date(r.start + 'T00:00:00'), e = new Date(r.end + 'T00:00:00');
  const diff = Math.round((s - today) / 864e5);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-DAY';
  if (today <= e) return `${Math.round((today - s) / 864e5) + 1}일차`;
  return '다녀옴';
}
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
  if (action) t.querySelector('button').onclick = () => { action.fn(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2400);
}
async function copy(text, msg = '복사했어요') {
  try { await navigator.clipboard.writeText(text); toast(msg); } catch (e) { prompt('아래 내용을 복사하세요', text); }
}
function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
  const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme:dark)').matches);
  $('meta[name=theme-color]')?.setAttribute('content', dark ? '#0e1412' : '#f6faf8');
}

// ───────── 방 / 멤버 ─────────
const room = () => S.rooms[route().id];
const member = (r, id) => r.members.find((m) => m.id === id) || { id, name: '?', color: '#999' };
const meId = (r) => S.me[r.id];
const av = (m, s) => `<span class="av" title="${esc(m.name)}" style="background:${m.color}${s ? `;width:${s}px;height:${s}px;font-size:${Math.round(s * 0.42)}px` : ''}">${esc(m.name.slice(0, 1))}</span>`;
function touch(r, item) { const t = now(); if (item) item.upd = t; r.updatedAt = t; save(); queuePush(r); }

// ───────── 실시간 공유방 (Cloudflare Worker) ─────────
const SYNC = (window.MOA_CONFIG || {}).syncUrl || '';
const sync = { timer: {}, busy: {}, online: true, deferred: false };
const shared = (r) => !!(SYNC && S.sync?.[r?.id]);
const newKey = () => b64u(crypto.getRandomValues(new Uint8Array(24)));
async function api(method, id, { body, v, path = '', auth } = {}) {
  const s = auth || S.sync[id];
  const headers = { 'X-Room-Key': s.key };
  if (s.pass) headers['X-Room-Pass'] = s.pass;
  if (s.admin) headers['X-Room-Admin'] = s.admin;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${SYNC}/rooms/${id}${path}${v ? `?v=${v}` : ''}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;
  if (res.ok && path.startsWith('/photos/')) return res.blob();
  const js = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(js.error || '서버에 연결하지 못했어요'); Object.assign(e, { status: res.status, needPass: js.needPass, wrong: js.wrong, locked: js.locked }); throw e; }
  return js;
}
const isRef = (p) => typeof p === 'string' && p.startsWith('p:');
const refsOnly = (x) => ({ ...x, photos: (x.photos || []).filter(isRef) });
const forSync = (r) => ({ ...r, journal: r.journal.map(refsOnly), docs: (r.docs || []).map(refsOnly), expenses: r.expenses.map(refsOnly) });
function applyRemote(id, res) {
  const local = S.rooms[id];
  const merged = local ? mergeRoom(local, res.room) : res.room;
  const changed = !local || JSON.stringify(forSync(merged)) !== JSON.stringify(forSync(local));
  S.rooms[id] = merged; Object.assign(S.sync[id], { v: res.version, hasPass: !!res.hasPass, needPass: false }); save();
  if (changed && route().id === id) safeRender();
}
function safeRender() {
  const a = document.activeElement;
  if ($('#modal-root').innerHTML || dragId || (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.value)) { sync.deferred = true; return; }
  sync.deferred = false; render();
}
function onSyncError(id, e) {
  if (e.needPass) { S.sync[id].needPass = true; delete S.sync[id].pass; save(); if (route().id === id) safeRender(); return; }
  setOnline(false);
}
function setOnline(ok) { if (sync.online !== ok) { sync.online = ok; const el = $('.sync-pill'); if (el) el.outerHTML = syncPill(room()); } }
function syncPill(r) {
  if (!shared(r)) return '';
  const s = S.sync[r.id];
  return `<span class="sync-pill ${sync.online ? '' : 'off'}" title="${sync.online ? '친구들이 바꾼 내용이 몇 초 안에 보여요' : '연결이 끊겼어요. 다시 연결되면 자동으로 합쳐요'}"><i></i>${sync.online ? '함께 보는 중' : '연결 끊김'}${s.hasPass ? ` ${I('key', 12, 2)}` : ''}</span>`;
}
function queuePush(r) {
  if (!shared(r) || S.sync[r.id].needPass) return;
  clearTimeout(sync.timer[r.id]);
  sync.timer[r.id] = setTimeout(() => pushNow(r.id), 350);
}
async function pushNow(id) {
  const s = S.sync[id], r = S.rooms[id]; if (!s || !r || s.needPass) return;
  if (sync.busy[id]) { sync.timer[id] = setTimeout(() => pushNow(id), 300); return; }
  sync.busy[id] = true;
  try { applyRemote(id, await api('PUT', id, { body: { room: forSync(r) } })); setOnline(true); }
  catch (e) { onSyncError(id, e); if (!e.needPass && e.status !== 403 && e.status !== 404) sync.timer[id] = setTimeout(() => pushNow(id), 5000); else if (!e.needPass) toast(e.message); }
  finally { sync.busy[id] = false; }
}
async function pollNow() {
  const r = route().page === 'room' ? room() : null;
  if (!shared(r) || document.hidden || sync.busy[r.id] || S.sync[r.id].needPass) return;
  try { const res = await api('GET', r.id, { v: S.sync[r.id].v }); if (res) applyRemote(r.id, res); setOnline(true); if (sync.deferred) safeRender(); }
  catch (e) { onSyncError(r.id, e); }
}
setInterval(pollNow, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) pollNow(); });
addEventListener('online', () => { const r = room(); if (shared(r)) pushNow(r.id); });
document.addEventListener('focusout', () => setTimeout(() => { if (sync.deferred) safeRender(); }, 50));
async function makeShared(r) {
  const auth = { key: newKey(), admin: newKey() };
  const res = await api('POST', r.id, { body: { room: forSync(r) }, auth });
  S.sync = S.sync || {}; S.sync[r.id] = { ...auth, v: res.version, hasPass: false };
  sysMsg(r, `${member(r, meId(r)).name}님이 함께 보는 여행방을 열었어요`); touch(r);
}
const sharedUrl = (r) => `${location.href.split('#')[0]}#s=${r.id}.${S.sync[r.id].key}`;
async function joinShared(id, key, pass) {
  const prev = S.sync?.[id];
  const auth = { key, pass: pass || prev?.pass, admin: prev?.admin };
  const res = await api('GET', id, { auth });
  S.sync = S.sync || {}; S.sync[id] = { ...auth, v: res.version, hasPass: !!res.hasPass };
  const ex = S.rooms[id];
  S.rooms[id] = ex ? mergeRoom(ex, res.room) : res.room; save();
  if (ex) queuePush(S.rooms[id]);
  return { room: S.rooms[id], existed: !!ex };
}
function passPrompt(id, key, wrong) {
  openModal({
    title: '입장 비밀번호',
    body: `<p class="muted" style="margin:0">방장이 비밀번호를 걸어둔 여행방이에요. 방장에게 받은 비밀번호를 입력해 주세요.</p>
      <label class="field"><span>비밀번호</span><input type="password" name="pw" required autocomplete="current-password" maxlength="40"></label>
      ${wrong ? `<p class="err">${esc(wrong)}</p>` : ''}`,
    ok: '들어가기',
    onOk(f) {
      const pw = f.pw.value;
      joinShared(id, key, pw).then(({ room: jr }) => { toast(`'${jr.name}'에 들어왔어요`); go(`#/r/${jr.id}/places`); })
        .catch((e) => setTimeout(() => (e.needPass ? passPrompt(id, key, e.message) : toast(e.message)), 50));
    },
  });
}
function passGate(r) {
  return `<div class="card gate">${empty('key', '비밀번호가 필요해요', '방장이 비밀번호를 걸었거나 바꿨어요. 받은 비밀번호를 입력하면 이어서 볼 수 있어요.')}
    <form class="row" data-form="gate" style="max-width:360px;margin:-8px auto 32px;padding:0 20px"><input type="password" name="t" required placeholder="비밀번호" class="grow" autocomplete="current-password" aria-label="비밀번호"><button class="btn pri">확인</button></form></div>`;
}
// 공유 사진: 서버에서 받아 화면에 붙이기
const ph = (src, alt = '사진') => (isRef(src) ? `<span class="ph"><img data-photo="${esc(src)}" alt="${alt}" data-act="photo"></span>` : `<span class="ph"><img src="${src}" alt="${alt}" data-act="photo" class="ready" loading="lazy"></span>`);
const photoCache = new Map();
async function uploadPhotos(r, list) {
  if (!shared(r)) return list;
  const out = [];
  for (const d of list) {
    try { const { pid } = await api('POST', r.id, { path: '/photos', body: { data: d } }); out.push('p:' + pid); }
    catch (e) { out.push(d); toast('사진 하나를 올리지 못해 이 기기에만 저장했어요'); }
  }
  return out;
}
function hydratePhotos() {
  const r = room(); if (!r) return;
  $$('img[data-photo]').forEach(async (img) => {
    const ref = img.dataset.photo;
    if (!photoCache.has(ref)) photoCache.set(ref, api('GET', r.id, { path: `/photos/${ref.slice(2)}` }).then((b) => URL.createObjectURL(b)).catch(() => ''));
    const url = await photoCache.get(ref);
    if (url) { img.src = url; img.classList.add('ready'); } else img.closest('.ph')?.classList.add('broken');
  });
}
function sysMsg(r, text) { r.messages.push({ id: uid(), sys: true, text, at: now(), upd: now() }); }
function removeUndo(r, key, id, label) {
  const arr = r[key], i = arr.findIndex((x) => x.id === id); if (i < 0) return;
  const [it] = arr.splice(i, 1);
  r.del = r.del || {}; r.del[id] = now(); touch(r); render();
  toast(`${label} 삭제했어요`, { label: '되돌리기', fn() { arr.splice(i, 0, it); delete r.del[id]; touch(r, it); render(); } });
}
function newRoom({ name, dest, start, end, members, tone: tn }) {
  const ms = members.map((n, i) => ({ id: uid(), name: n, color: COLORS[i % COLORS.length], upd: now() }));
  return { id: uid(), name, dest, tone: tn, start, end, members: ms, places: [], messages: [], expenses: [], checklist: [], journal: [], docs: [], del: {}, createdAt: now(), updatedAt: now(), mapProvider: 'auto' };
}
function demoRoom() {
  const start = isoDate(addDays(isoDate(new Date()), 7));
  const r = newRoom({ name: '우리의 느긋한 제주', dest: '제주', start, end: isoDate(addDays(start, 2)), members: ['나', '유진', '민수', '지우'], tone: 0 });
  r.id = 'demo'; r.demo = true;
  const [me, yu, mi, ji] = r.members.map((m) => m.id);
  const P = (name, c, addr, memo, by, hearts, day, lat, lng, order, time = '') => ({ id: uid(), name, cat: c, addr, memo, by, hearts, day, lat, lng, order, time, comments: [], at: now() - (10 - order) * 6e5 - hearts.length * 1e5, upd: now() });
  r.places = [
    P('동문시장', 'food', '제주 제주시 관덕로14길 20', '먹고 싶은 거 하나씩 골라서 나눠 먹기', mi, [mi, yu], 1, 33.5122, 126.5269, 0, '12:00'),
    P('함덕해수욕장', 'spot', '제주 제주시 조천읍 함덕리', '첫날은 바다부터! 해 질 때 같이 산책하자.', yu, [yu, mi, ji], 1, 33.5432, 126.6697, 1, '17:30'),
    P('비자림', 'spot', '제주 제주시 구좌읍 비자숲길 55', '여기는 천천히 걸어보고 싶어', ji, [ji, me], 2, 33.4900, 126.8090, 0, '10:00'),
    P('성산일출봉', 'spot', '제주 서귀포시 성산읍 성산리', '일출은 무리일까? 다들 의견 알려줘!', yu, [yu, me], null, 33.4581, 126.9425, 3),
    P('애월 바다 보이는 카페', 'cafe', '제주 제주시 애월읍 애월해안로', '마지막 날 공항 가기 전에 들르면 좋겠어.', mi, [mi], null, 33.4636, 126.3100, 4),
  ];
  r.places[3].comments.push({ id: uid(), by: mi, text: '일출 말고 오후에 가도 좋을 듯!', at: now() - 3e6 });
  const t0 = now() - 864e5;
  r.messages = [
    { id: uid(), by: yu, text: '드디어 제주 간다 🥹 가고 싶은 곳 다 모아두자!', at: t0 },
    { id: uid(), by: yu, text: '하트 많이 받은 곳부터 일정에 넣자', at: t0 + 6e4 },
    { id: uid(), by: mi, text: '동문시장은 무조건. 먹을 거 담당 할게', at: t0 + 4e5 },
    { id: uid(), by: ji, text: '비자림 넣어뒀어. 2일차 오전 어때?', at: now() - 7e6 },
    { id: uid(), sys: true, text: '유진님이 \'성산일출봉\'을(를) 모았어요', at: now() - 6e6 },
  ];
  r.expenses = [
    { id: uid(), title: '항공권 (왕복)', amount: 412000, cat: 'move', payer: yu, split: [me, yu, mi, ji], at: now() - 5e6 },
    { id: uid(), title: '애월 독채 숙소 2박', amount: 380000, cat: 'stay', payer: mi, split: [me, yu, mi, ji], at: now() - 4e6 },
    { id: uid(), title: '렌터카 3일', amount: 96000, cat: 'move', payer: me, split: [me, yu, mi, ji], at: now() - 3e6 },
  ];
  r.checklist = [
    { id: uid(), text: '신분증', who: null, done: false }, { id: uid(), text: '블루투스 스피커', who: mi, done: true },
    { id: uid(), text: '필름 카메라', who: ji, done: false }, { id: uid(), text: '렌터카 예약 확인', who: me, done: false },
  ];
  return r;
}

// ───────── 지도 제공자 (카카오 / 구글 / OSM) ─────────
const CFG = window.MOA_CONFIG || {};
const mapKeys = () => ({ kakao: S.keys?.kakao || CFG.kakaoKey || '', google: S.keys?.google || CFG.googleKey || '' });
const provider = (r) => { const p = r.mapProvider || 'auto'; return p === 'auto' ? (KR.test(r.dest + ' ' + r.name) ? 'kakao' : 'google') : p; };
const PNAME = { kakao: '카카오맵', google: '구글맵', osm: 'OpenStreetMap' };
const scripts = {};
function loadScript(src) {
  return (scripts[src] ||= new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = res; s.onerror = () => { delete scripts[src]; rej(new Error('script')); };
    document.head.append(s);
  }));
}
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
async function sdk(kind) {
  const k = mapKeys()[kind];
  if (!k || failed[kind]) return false;
  try {
    if (kind === 'kakao') {
      if (!window.kakao?.maps?.services) {
        await loadScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${enc(k)}&libraries=services&autoload=false`);
        await withTimeout(new Promise((r) => window.kakao.maps.load(r)), 7000);
      }
      return true;
    }
    if (!window.google?.maps?.Map) {
      await withTimeout(new Promise((res, rej) => {
        window.__moaG = res;
        window.gm_authFailure = () => { failed.google = true; toast('구글 지도 키를 확인해 주세요. 기본 지도로 보여드려요.'); mapCtl?.destroy(); mapCtl = null; render(); };
        loadScript(`https://maps.googleapis.com/maps/api/js?key=${enc(k)}&language=ko&libraries=places&callback=__moaG`).catch(rej);
      }), 9000);
    }
    return true;
  } catch (e) { failed[kind] = true; return false; }
}
const KAKAO_CAT = { FD6: 'food', CE7: 'cafe', AD5: 'stay', AT4: 'spot', CT1: 'spot', MT1: 'shop', CS2: 'shop' };
function center(r) {
  const p = r.places.filter((x) => x.lat); if (!p.length) return null;
  return [p.reduce((s, x) => s + x.lat, 0) / p.length, p.reduce((s, x) => s + x.lng, 0) / p.length];
}
async function searchPlaces(q, r) {
  const pv = provider(r);
  if (await sdk(pv)) {
    try {
      if (pv === 'kakao') {
        const S2 = kakao.maps.services.Status;
        const c = center(r);
        const out = await new Promise((res) => new kakao.maps.services.Places().keywordSearch(q, (d, st) => res(st === S2.OK ? d : st === S2.ZERO_RESULT ? [] : null), c ? { size: 10, location: new kakao.maps.LatLng(c[0], c[1]) } : { size: 10 }));
        if (out) return { src: 'kakao', items: out.map((d) => ({ name: d.place_name, addr: d.road_address_name || d.address_name, lat: +d.y, lng: +d.x, cat: KAKAO_CAT[d.category_group_code], url: d.place_url, kid: d.id, hint: (d.category_name || '').split(' > ').pop() })) };
      } else {
        const { Place } = await google.maps.importLibrary('places');
        const { places } = await Place.searchByText({ textQuery: q, fields: ['displayName', 'formattedAddress', 'location', 'id', 'primaryTypeDisplayName', 'types'], language: 'ko', maxResultCount: 10 });
        const gcat = (t = []) => (t.includes('cafe') ? 'cafe' : t.includes('restaurant') || t.includes('food') ? 'food' : t.includes('lodging') ? 'stay' : t.some((x) => /store|shopping/.test(x)) ? 'shop' : t.some((x) => /tourist|park|museum|natural/.test(x)) ? 'spot' : undefined);
        return { src: 'google', items: places.map((p) => ({ name: p.displayName, addr: p.formattedAddress, lat: p.location.lat(), lng: p.location.lng(), gid: p.id, cat: gcat(p.types), hint: p.primaryTypeDisplayName || '' })) };
      }
    } catch (e) { console.warn('[모아여행] 지도 검색 실패, OSM으로 대체', e); }
  }
  const c = center(r);
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${enc(q)}&limit=10${c ? `&lat=${c[0]}&lon=${c[1]}` : ''}`);
    const js = await res.json();
    if (js.features?.length) {
      const oc = (v = '') => (/restaurant|fast_food|food|bar|pub/.test(v) ? 'food' : /cafe|bakery/.test(v) ? 'cafe' : /hotel|guest|hostel|motel|apartment/.test(v) ? 'stay' : /mall|shop|market|supermarket|department/.test(v) ? 'shop' : /attraction|viewpoint|beach|park|museum|peak|forest|garden|castle|temple|island/.test(v) ? 'spot' : undefined);
      return { src: 'osm', items: js.features.map((f) => { const p = f.properties; return { cat: oc(p.osm_value), name: p.name || p.street || q, addr: [p.state, p.city || p.county, p.district, p.street, p.housenumber].filter(Boolean).join(' ') || p.country || '', lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], hint: p.osm_value?.replace(/_/g, ' ') }; }) };
    }
  } catch (e) { /* 다음 */ }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=ko&q=${enc(q)}`);
    const js = await res.json();
    return { src: 'osm', items: js.map((x) => ({ name: x.name || x.display_name.split(',')[0], addr: x.display_name.split(',').slice(0, 4).reverse().map((s) => s.trim()).join(' '), lat: +x.lat, lng: +x.lon, hint: x.type })) };
  } catch (e) { return { src: 'osm', items: [], error: true }; }
}
// 외부 지도 링크
function placeLink(r, p, kind = provider(r)) {
  const q = `${p.name} ${p.addr || ''}`.trim();
  if (kind === 'naver') return `https://map.naver.com/p/search/${enc(q)}`;
  if (kind === 'kakao') return p.kid ? `https://place.map.kakao.com/${p.kid}` : p.lat ? `https://map.kakao.com/link/map/${enc(p.name)},${p.lat},${p.lng}` : `https://map.kakao.com/link/search/${enc(q)}`;
  return p.gid ? `https://www.google.com/maps/search/?api=1&query=${enc(p.name)}&query_place_id=${p.gid}` : `https://www.google.com/maps/search/?api=1&query=${enc(p.lat ? `${p.lat},${p.lng}` : q)}`;
}
function navLink(r, p) {
  if (provider(r) === 'kakao' && p.lat) return `https://map.kakao.com/link/to/${enc(p.name)},${p.lat},${p.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(p.lat ? `${p.lat},${p.lng}` : `${p.name} ${p.addr || ''}`)}${p.gid ? `&destination_place_id=${p.gid}` : ''}`;
}
function routeUrl(r, items) {
  if (provider(r) === 'kakao' && items.every((p) => p.lat) && items.length <= 6) {
    return `https://map.kakao.com/link/by/car/${items.map((p) => `${enc(p.name)},${p.lat},${p.lng}`).join('/')}`;
  }
  const loc = (p) => (p.lat ? `${p.lat},${p.lng}` : `${p.name} ${p.addr || ''}`.trim());
  const w = items.slice(1, -1).map(loc).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(loc(items[0]))}&destination=${enc(loc(items[items.length - 1]))}${w ? '&waypoints=' + enc(w) : ''}`;
}
// 지도 위젯 — 렌더 사이에도 살아남도록 DOM 노드를 보관했다가 다시 꽂는다
function pinData(r) {
  return r.places.filter((p) => p.lat).map((p) => {
    const day = p.day ? r.places.filter((x) => x.day === p.day).sort(sortPlan).indexOf(p) + 1 : 0;
    return { p, color: p.day ? COLORS[(p.day - 1) % COLORS.length] : cat(p.cat).c, label: day ? String(day) : '', dim: !p.day };
  });
}
function lines(r) {
  const out = [];
  for (let d = 1; d <= dayCount(r); d++) {
    const pts = r.places.filter((p) => p.day === d && p.lat).sort(sortPlan);
    if (pts.length > 1) out.push({ color: COLORS[(d - 1) % COLORS.length], pts });
  }
  return out;
}
function pinEl(pd) {
  const el = document.createElement('div');
  el.className = 'pin' + (pd.dim ? ' dim' : '');
  el.style.setProperty('--c', pd.color);
  el.innerHTML = `<span>${pd.label}</span>`;
  el.title = pd.p.name;
  return el;
}
function createMap(r) {
  const el = document.createElement('div'); el.id = 'map';
  const want = provider(r);
  const ctl = { el, roomId: r.id, pv: want, kind: null, r, impl: null, fitted: false,
    update(nr) { this.r = nr; this.impl?.draw(nr); },
    focus(id) { this.impl?.focus(id); },
    hl(id, on) { this.impl?.hl(id, on); },
    resize() { this.impl?.resize(); },
    destroy() { this.impl?.destroy(); this.dead = true; },
  };
  const onPick = (id) => pickOnMap(id);
  sdk(want).then((ok) => {
    if (ctl.dead) return;
    ctl.kind = ok ? want : 'osm';
    ctl.impl = (ok ? (want === 'kakao' ? kakaoImpl : googleImpl) : osmImpl)(el, onPick);
    requestAnimationFrame(() => { if (!ctl.dead) ctl.impl.draw(ctl.r, true); });
    $('.map-src')?.replaceChildren(document.createTextNode(PNAME[ctl.kind]));
  });
  return ctl;
}
function osmImpl(el, onPick) {
  if (!window.L) return { draw() {}, focus() {}, hl() {}, resize() {}, destroy() {} };
  const m = L.map(el, { scrollWheelZoom: true, zoomControl: true, attributionControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  let layer = L.layerGroup().addTo(m), mk = {};
  return {
    draw(r, fit) {
      layer.clearLayers(); mk = {};
      const pd = pinData(r);
      lines(r).forEach((l) => L.polyline(l.pts.map((p) => [p.lat, p.lng]), { color: l.color, weight: 3, opacity: 0.75, dashArray: '2 7', lineCap: 'round' }).addTo(layer));
      pd.forEach((d) => {
        const s = d.dim ? 16 : 28;
        const icon = L.divIcon({ className: '', html: pinEl(d).outerHTML, iconSize: [s, s], iconAnchor: [s / 2, s] });
        mk[d.p.id] = L.marker([d.p.lat, d.p.lng], { icon, title: d.p.name, zIndexOffset: d.dim ? 0 : 500 }).addTo(layer).on('click', () => onPick(d.p.id));
      });
      if (fit) { m.invalidateSize(); if (pd.length) m.fitBounds(L.latLngBounds(pd.map((d) => [d.p.lat, d.p.lng])).pad(0.15), { maxZoom: 14 }); else m.setView([36.4, 127.8], 7); }
    },
    focus(id) { const x = mk[id]; if (x) m.flyTo(x.getLatLng(), Math.max(m.getZoom(), 14), { duration: 0.6 }); },
    hl(id, on) { mk[id]?.getElement()?.querySelector('.pin')?.classList.toggle('hl', on); mk[id]?.setZIndexOffset(on ? 1000 : 0); },
    resize() { setTimeout(() => m.invalidateSize(), 0); },
    destroy() { m.remove(); },
  };
}
function kakaoImpl(el, onPick) {
  const K = kakao.maps;
  const m = new K.Map(el, { center: new K.LatLng(33.38, 126.55), level: 9 });
  m.addControl(new K.ZoomControl(), K.ControlPosition.RIGHT);
  let objs = [], mk = {};
  return {
    draw(r, fit) {
      objs.forEach((o) => o.setMap(null)); objs = []; mk = {};
      lines(r).forEach((l) => objs.push(new K.Polyline({ map: m, path: l.pts.map((p) => new K.LatLng(p.lat, p.lng)), strokeWeight: 3, strokeColor: l.color, strokeOpacity: 0.8, strokeStyle: 'shortdot' })));
      const pd = pinData(r), b = new K.LatLngBounds();
      pd.forEach((d) => {
        const pos = new K.LatLng(d.p.lat, d.p.lng); b.extend(pos);
        const c = pinEl(d); c.style.cursor = 'pointer'; c.onclick = () => onPick(d.p.id);
        const o = new K.CustomOverlay({ map: m, position: pos, content: c, yAnchor: 1, zIndex: d.dim ? 1 : 2 });
        objs.push(o); mk[d.p.id] = { o, c, pos };
      });
      if (fit && pd.length) { if (pd.length === 1) { m.setCenter(b.getSouthWest()); m.setLevel(4); } else m.setBounds(b, 40, 40, 40, 40); }
    },
    focus(id) { const x = mk[id]; if (x) { if (m.getLevel() > 5) m.setLevel(5); m.panTo(x.pos); } },
    hl(id, on) { const x = mk[id]; if (x) { x.c.classList.toggle('hl', on); x.o.setZIndex(on ? 10 : 2); } },
    resize() { setTimeout(() => m.relayout(), 0); },
    destroy() { objs.forEach((o) => o.setMap(null)); },
  };
}
function googleImpl(el, onPick) {
  const G = google.maps;
  const m = new G.Map(el, { center: { lat: 35.68, lng: 139.76 }, zoom: 10, disableDefaultUI: true, zoomControl: true, clickableIcons: false, gestureHandling: 'greedy' });
  let objs = [], mk = {};
  const icon = (d, big) => ({ path: G.SymbolPath.CIRCLE, scale: (d.dim ? 6 : 11) * (big ? 1.35 : 1), fillColor: d.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 });
  return {
    draw(r, fit) {
      objs.forEach((o) => o.setMap(null)); objs = []; mk = {};
      lines(r).forEach((l) => objs.push(new G.Polyline({ map: m, path: l.pts.map((p) => ({ lat: p.lat, lng: p.lng })), strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, strokeColor: l.color, scale: 3 }, offset: '0', repeat: '12px' }] })));
      const pd = pinData(r), b = new G.LatLngBounds();
      pd.forEach((d) => {
        const pos = { lat: d.p.lat, lng: d.p.lng }; b.extend(pos);
        const o = new G.Marker({ map: m, position: pos, title: d.p.name, icon: icon(d), label: d.label ? { text: d.label, color: '#fff', fontSize: '11px', fontWeight: '700' } : null, zIndex: d.dim ? 1 : 2 });
        o.addListener('click', () => onPick(d.p.id));
        objs.push(o); mk[d.p.id] = { o, d };
      });
      if (fit && pd.length) { if (pd.length === 1) { m.setCenter(b.getCenter()); m.setZoom(14); } else m.fitBounds(b, 48); }
    },
    focus(id) { const x = mk[id]; if (x) { m.panTo(x.o.getPosition()); if (m.getZoom() < 14) m.setZoom(14); } },
    hl(id, on) { const x = mk[id]; if (x) { x.o.setIcon(icon(x.d, on)); x.o.setZIndex(on ? 10 : 2); } },
    resize() {},
    destroy() { objs.forEach((o) => o.setMap(null)); },
  };
}
// 장소 추가 창 안의 "지도에서 직접 고르기"
async function mountPicker(el, r, start, onPick) {
  const pv = provider(r), ok = await sdk(pv);
  const c = start || center(r) || (pv === 'kakao' || KR.test(r.dest) ? [37.5665, 126.978] : null);
  if (ok && pv === 'kakao') {
    const K = kakao.maps;
    const m = new K.Map(el, { center: new K.LatLng(...(c || [37.5665, 126.978])), level: start ? 4 : 7 });
    const mk = new K.Marker({ position: m.getCenter() }); if (start) mk.setMap(m);
    K.event.addListener(m, 'click', (e) => { mk.setPosition(e.latLng); mk.setMap(m); onPick(e.latLng.getLat(), e.latLng.getLng()); });
    return;
  }
  if (ok && pv === 'google') {
    const G = google.maps;
    const m = new G.Map(el, { center: c ? { lat: c[0], lng: c[1] } : { lat: 20, lng: 0 }, zoom: start ? 15 : c ? 11 : 2, disableDefaultUI: true, zoomControl: true, clickableIcons: false, gestureHandling: 'greedy' });
    const mk = new G.Marker({ map: start ? m : null, position: start ? { lat: start[0], lng: start[1] } : null });
    m.addListener('click', (e) => { mk.setPosition(e.latLng); mk.setMap(m); onPick(e.latLng.lat(), e.latLng.lng()); });
    return;
  }
  if (!window.L) return;
  const m = L.map(el).setView(c || [20, 0], start ? 16 : c ? 11 : 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  const icon = L.divIcon({ className: '', html: '<div class="pin" style="--c:var(--warm)"><span></span></div>', iconSize: [28, 28], iconAnchor: [14, 28] });
  let mk = start ? L.marker(start, { icon }).addTo(m) : null;
  m.on('click', (e) => { if (mk) mk.setLatLng(e.latlng); else mk = L.marker(e.latlng, { icon }).addTo(m); onPick(e.latlng.lat, e.latlng.lng); });
  setTimeout(() => m.invalidateSize(), 50);
}
async function reverseAddr(lat, lng) {
  if (window.kakao?.maps?.services && !failed.kakao) {
    const a = await new Promise((res) => new kakao.maps.services.Geocoder().coord2Address(lng, lat, (d, st) => res(st === kakao.maps.services.Status.OK ? d[0] : null)));
    if (a) return a.road_address?.address_name || a.address?.address_name || '';
  }
  try {
    const js = await (await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ko&lat=${lat}&lon=${lng}`)).json();
    return (js.display_name || '').split(',').slice(0, 5).reverse().map((s) => s.trim()).join(' ');
  } catch (e) { return ''; }
}
function pickOnMap(id) {
  const card = $(`.place[data-pid="${id}"]`);
  if (card && card.offsetParent) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash'); }
  else { ui.sel = id; const box = $('#map-sel'); const r = room(); const p = r?.places.find((x) => x.id === id); if (box && p) box.innerHTML = placeCard(r, p); }
}

// ───────── 라우팅 ─────────
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, id, tab] = h.split('/');
  if (a === 'r' && id) return { page: 'room', id, tab: TABS.some((t) => t.k === tab) ? tab : 'places' };
  return { page: 'home' };
}
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
window.addEventListener('hashchange', () => { closeModal(); checkJoin(); ui.sel = null; render(); scrollTo(0, 0); });
matchMedia('(min-width:1181px)').addEventListener('change', () => render());
addEventListener('scroll', () => $('.topbar')?.classList.toggle('scrolled', scrollY > 4), { passive: true });

// ───────── 공유 링크 ─────────
const b64u = (bytes) => { let s = ''; bytes.forEach((b) => (s += String.fromCharCode(b))); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function encodeRoom(r) {
  const c = { ...r, journal: r.journal.map((j) => ({ ...j, photos: [] })) }; delete c.demo;
  const bytes = new TextEncoder().encode(JSON.stringify(c));
  if (window.CompressionStream) return 'z' + b64u(await pipe(bytes, new CompressionStream('deflate-raw')));
  return 'p' + b64u(bytes);
}
async function decodeRoom(s) {
  const bytes = unb64u(s.slice(1));
  const raw = s[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
  return JSON.parse(new TextDecoder().decode(raw));
}
const shareLink = async (r) => `${location.href.split('#')[0]}#join=${await encodeRoom(r)}`;
function mergeRoom(a, b) {
  const del = { ...(a.del || {}), ...(b.del || {}) };
  const out = { ...((b.updatedAt || 0) > (a.updatedAt || 0) ? b : a), del };
  const photos = {}; (a.journal || []).forEach((j) => (photos[j.id] = j.photos));
  for (const k of ['members', 'places', 'messages', 'expenses', 'checklist', 'journal', 'docs']) {
    const m = new Map();
    [...(a[k] || []), ...(b[k] || [])].forEach((x) => { const c = m.get(x.id); if (!c || (x.upd || x.at || 0) >= (c.upd || c.at || 0)) m.set(x.id, x); });
    out[k] = [...m.values()].filter((x) => !del[x.id]);
  }
  out.journal.forEach((j) => { if (!j.photos?.length && photos[j.id]) j.photos = photos[j.id]; });
  out.messages.sort((x, y) => x.at - y.at);
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}
async function checkJoin() {
  const sm = location.hash.match(/^#s=([a-z0-9]{6,24})\.([A-Za-z0-9_-]{20,64})$/);
  if (sm) {
    if (!SYNC) { toast('공유방 서버가 설정되지 않았어요'); history.replaceState(null, '', location.pathname + '#/'); return render(); }
    try {
      const { room: jr, existed } = await joinShared(sm[1], sm[2]);
      toast(existed ? '공유방과 다시 연결했어요' : `'${jr.name}' 공유방에 들어왔어요`);
      history.replaceState(null, '', location.pathname + `#/r/${jr.id}/places`);
    } catch (e) {
      history.replaceState(null, '', location.pathname + '#/');
      render();
      if (e.needPass) return passPrompt(sm[1], sm[2], e.locked ? e.message : '');
      toast(e.status === 403 ? '초대 링크가 올바르지 않아요' : e.status === 404 ? '여행방을 찾을 수 없어요' : '서버에 연결하지 못했어요. 잠시 후 다시 열어주세요.');
      return;
    }
    return render();
  }
  const m = location.hash.match(/^#join=(.+)$/); if (!m) return;
  try {
    const inc = await decodeRoom(m[1]);
    const ex = S.rooms[inc.id];
    S.rooms[inc.id] = ex ? mergeRoom(ex, inc) : inc; save();
    toast(ex ? '친구들의 최신 내용을 합쳤어요' : `'${inc.name}' 여행방에 들어왔어요`);
    history.replaceState(null, '', location.pathname + `#/r/${inc.id}/places`);
  } catch (e) {
    toast('링크를 읽지 못했어요. 링크가 잘렸는지 확인해 주세요.');
    history.replaceState(null, '', location.pathname + '#/');
  }
  render();
}

// ───────── 모달 / 시트 ─────────
function openModal({ title, body, ok = '저장', onOk, danger, raw, onClose }) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay"><form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="grab"></div>
    <div class="modal-h"><h2>${title}</h2><button type="button" class="btn ghost icon sm" data-close aria-label="닫기">${I('x')}</button></div>
    ${raw ? body : `<div class="modal-b">${body}</div>`}
    ${onOk ? `<div class="modal-f"><button type="button" class="btn" data-close>취소</button><button class="btn ${danger ? 'danger-fill' : 'pri'}">${ok}</button></div>` : ''}
  </form></div>`;
  const form = $('form', root);
  form._onClose = onClose;
  form.addEventListener('submit', (e) => { e.preventDefault(); if (onOk && onOk(form) !== false) closeModal(); });
  $$('[data-close]', root).forEach((b) => b.addEventListener('click', () => closeModal()));
  $('.overlay', root).addEventListener('mousedown', (e) => { if (e.target.classList.contains('overlay')) closeModal(); });
  if (matchMedia('(hover:hover)').matches) setTimeout(() => form.querySelector('input:not([type=hidden]):not([type=radio]):not([type=checkbox]),textarea')?.focus(), 40);
  // 칩형 라디오/체크박스 상태 동기화
  form.addEventListener('change', (e) => {
    if (e.target.matches('.chip input,.tone input')) $$('.chip input,.tone input', form).forEach((x) => x.parentElement.classList.toggle('on', x.checked));
  });
  return form;
}
function closeModal() {
  const f = $('#modal-root form'); const cb = f?._onClose;
  $('#modal-root').innerHTML = '';
  cb?.();
  if (sync.deferred) setTimeout(safeRender, 0);
}
function confirmBox({ title, msg, ok = '확인', danger }) {
  return new Promise((res) => {
    let done = false;
    openModal({ title, body: `<p style="margin:0;color:var(--muted)">${msg}</p>`, ok, danger, onOk() { done = true; res(true); }, onClose() { if (!done) res(false); } });
  });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal(); });

// ───────── 렌더 ─────────
function render() {
  const rt = route();
  if (rt.page === 'room' && !S.rooms[rt.id]) {
    if (rt.id === 'demo') { S.rooms.demo = demoRoom(); S.me.demo = S.rooms.demo.members[0].id; save(); } else return go('#/');
  }
  const r = rt.page === 'room' ? S.rooms[rt.id] : null;
  if (r) r.docs ||= [];
  document.title = r ? `${r.name} · 모아여행` : '모아여행 · 함께 모아 만드는 우리 여행';
  const y = scrollY;
  $('#app').innerHTML = `<div class="shell ${r ? 'is-room' : 'is-home'}">${side(rt, r)}<div class="content">${topbar(r)}<main class="main" id="main">${r ? roomPage(r, rt.tab) : home()}</main></div>${r ? bnav(rt.tab) : ''}</div>`;
  document.body.classList.toggle('is-home', !r);
  // 지도 다시 꽂기
  const slot = $('#map-slot');
  if (slot && r) {
    if (mapCtl && !mapCtl.dead && mapCtl.roomId === r.id && mapCtl.pv === provider(r)) { slot.replaceWith(mapCtl.el); mapCtl.update(r); mapCtl.resize(); }
    else { mapCtl?.destroy(); mapCtl = createMap(r); slot.replaceWith(mapCtl.el); }
    if (mapCtl.kind) $('.map-src')?.replaceChildren(document.createTextNode(PNAME[mapCtl.kind]));
  }
  if (r && rt.tab === 'chat') { const el = $('.msgs'); if (el) el.scrollTop = el.scrollHeight; }
  if (r) hydratePhotos();
  scrollTo(0, y);
  if (r && !meId(r)) setTimeout(() => pickMe(r), 60);
}

function brand() { return `<button class="brand" data-act="home" aria-label="모아여행 홈"><img class="brand-mark" src="icon.svg" alt="" width="34" height="34"><span class="brand-name">모아여행</span></button>`; }
function themeBtn(cls = 'btn ghost icon sm') {
  const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme:dark)').matches);
  return `<button class="${cls}" data-act="theme" aria-label="테마 바꾸기" title="테마 바꾸기">${I(dark ? 'sun' : 'moon')}</button>`;
}
function side(rt, r) {
  const rooms = Object.values(S.rooms).sort((a, b) => b.updatedAt - a.updatedAt);
  return `<aside class="side">
    ${brand()}
    ${r ? `<div>
      <div class="side-label">이번 여행</div>
      <nav class="nav">${TABS.map((t) => `<button class="${rt.tab === t.k ? 'on' : ''}" data-act="tab" data-k="${t.k}">${I(t.i)}<span>${t.n}</span>${counts(r, t.k)}</button>`).join('')}</nav>
    </div>` : ''}
    <div>
      <div class="side-label">내 여행</div>
      <nav class="nav">
        ${rooms.map((x) => `<button class="${r && r.id === x.id ? 'on' : ''}" data-act="open" data-id="${x.id}"><span class="trip-dot" style="background:${tone(x)[0]}"></span><span class="ellip">${esc(x.name)}</span></button>`).join('')}
        <button data-act="new-room">${I('plus')}<span>새 여행 만들기</span></button>
      </nav>
    </div>
    <div class="side-foot"><span class="faint" style="font-size:12px">계획은 가볍게, 추억은 가득하게</span>${themeBtn()}</div>
  </aside>`;
}
function topbar(r) {
  if (!r) return `<header class="topbar">${brand()}<span class="sp"></span>${themeBtn('btn ghost icon')}</header>`;
  return `<header class="topbar"><button class="btn ghost icon" data-act="home" aria-label="내 여행으로">${I('back', 20)}</button><div class="title">${esc(r.name)}</div><button class="btn ghost icon" data-act="share" aria-label="초대·공유">${I('share', 20)}</button></header>`;
}
function bnav(tab) {
  const inMore = !BNAV.includes(tab);
  return `<nav class="bnav" aria-label="여행 메뉴">${BNAV.map((k) => { const t = TABS.find((x) => x.k === k); return `<button class="${tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${I(t.i, 22)}<span>${t.n.replace('모아둔 곳', '장소').replace('우리 일정', '일정')}</span></button>`; }).join('')}
    <button class="${inMore ? 'on' : ''}" data-act="more">${I('grid', 22)}<span>더보기</span></button></nav>`;
}
function counts(r, k) {
  const n = { places: r.places.length, money: r.expenses.length, pack: r.checklist.filter((c) => !c.done).length, journal: r.journal.length, docs: (r.docs || []).length, chat: r.messages.filter((m) => !m.sys).length }[k];
  return n ? `<span class="cnt">${n}</span>` : '';
}
function empty(icon, title, desc, btn = '') {
  return `<div class="empty"><div class="ill">${I(icon, 26, 1.5)}</div><h3>${title}</h3><p>${desc}</p>${btn}</div>`;
}

// ───────── 홈 ─────────
function home() {
  const rooms = Object.values(S.rooms).sort((a, b) => b.updatedAt - a.updatedAt);
  const today = isoDate(new Date());
  const next = rooms.filter((x) => !x.demo && x.end >= today).sort((a, b) => a.start.localeCompare(b.start))[0];
  return `
  <section class="hero">
    <div>
      <div class="kicker">단체톡에 흩어진 여행 계획을 위한 곳</div>
      <h1>생각은 각자,<br><em>여행은 함께</em> 모아요.</h1>
      <p class="lead">가고 싶은 곳을 제안하고 하트로 고르면, 일정과 정산·준비물까지 한 링크 안에서 정리돼요. 설치도 가입도 필요 없어요.</p>
      <div class="row wrap"><button class="btn pri" data-act="new-room" style="height:46px;padding:0 20px">${I('plus')}새 여행 만들기</button><button class="btn" data-act="open" data-id="demo" style="height:46px;padding:0 18px">예시 여행 둘러보기</button></div>
    </div>
    <div class="preview" aria-hidden="${next ? 'false' : 'true'}">
      ${next ? `<button class="badge-next" data-act="open" data-id="${next.id}"><div class="dday-big">${dday(next)}</div><div class="grow"><div style="font-weight:700">${esc(next.name)}</div><div class="faint" style="font-size:13px">${esc(next.dest)} · ${range(next)} · ${nights(next)}</div></div><span style="transform:rotate(180deg);color:var(--faint)">${I('back', 18)}</span></button>` : ''}
      ${previewCard('명소', CATS[0].c, '유진', '#ff6a47', '함덕해수욕장', '첫날은 바다부터! 해 질 때 같이 산책하자.', 3, '1일차 17:30')}
      ${previewCard('맛집', CATS[1].c, '민수', '#3b82f6', '동문시장', '먹고 싶은 거 하나씩 골라서 나눠 먹기', 2, '1일차 12:00')}
    </div>
  </section>

  <div class="sec"><div><h2>내 여행 <span class="faint num" style="font-family:var(--sans);font-size:16px;font-weight:500">${rooms.filter((x) => !x.demo).length}</span></h2><p>함께 계획하는 설렘을 이어가세요.</p></div>
    <div class="acts"><button class="btn sm" data-act="import">${I('upload', 16)}링크·파일로 가져오기</button></div></div>
  <div class="trips">
    ${rooms.map(tripCard).join('')}
    ${rooms.some((x) => x.demo) ? '' : `<button class="trip" data-act="open" data-id="demo" style="opacity:.92"><div class="cover" style="${toneStyle({ id: 'demo', tone: 0 })}"><span class="badge">예시</span><div class="dest">제주</div></div><div class="trip-body"><h3>우리의 느긋한 제주</h3><div class="meta">제안 · 투표 · 일정 · 정산을 미리 체험해보세요</div></div></button>`}
    <button class="trip-new" data-act="new-room">${I('plus', 22)}<span>새 여행 만들기</span></button>
  </div>

  <div class="sec"><div><h2>이렇게 함께 만들어요</h2></div></div>
  <div class="how">
    ${[['01', '링크 하나로 모이고', '여행방을 만들고 단체톡에 링크를 보내요. 친구는 열기만 하면 돼요.'], ['02', '각자의 취향을 모으고', '카카오맵·구글맵에서 장소를 찾아 제안하고, 하트와 의견을 남겨요.'], ['03', '일정과 정산을 완성해요', '날짜에 끌어다 놓고, 쓴 돈은 누가 누구에게 보낼지 자동으로 계산해요.']]
      .map(([n, t, d]) => `<div><div class="n">${n}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
  <footer class="foot"><span>모아여행 — 조금 덜 바쁘게, 조금 더 우리답게.</span><span>데이터는 이 기기에만 저장돼요</span></footer>`;
}
function previewCard(cn, cc, who, wc, name, memo, hearts, day) {
  return `<div class="place" style="pointer-events:none"><div class="place-meta"><span class="dot" style="--c:${cc}"></span><span>${cn}</span><span>·</span><span class="av" style="background:${wc};width:18px;height:18px;font-size:8px">${who[0]}</span><span>${who}</span><span class="sp"></span><span class="tag accent">${day}</span></div>
    <h3 class="place-name">${name}</h3><p class="place-memo">${memo}</p>
    <div class="place-foot" style="margin-top:12px"><span class="heart on">${I('heart', 18, 1.8)}${hearts}</span></div></div>`;
}
function tripCard(x) {
  return `<button class="trip" data-act="open" data-id="${x.id}">
    <div class="cover" style="${toneStyle(x)}"><span class="badge">${x.demo ? '예시' : dday(x)}</span><div class="dest">${esc(x.dest)}</div></div>
    <div class="trip-body">
      <h3>${esc(x.name)}</h3>
      <div class="meta">${range(x)} · ${nights(x)}</div>
      <div class="row"><span class="avs">${x.members.slice(0, 5).map((m) => av(m, 24)).join('')}</span><span class="sp"></span><span class="faint" style="font-size:12px">장소 ${x.places.length}곳 · ${timeAgo(x.updatedAt)}</span></div>
    </div></button>`;
}

// ───────── 여행방 ─────────
function roomPage(r, tab) {
  const me = meId(r) ? member(r, meId(r)) : null;
  return `
  <section class="trip-head">
    <div class="cover" style="${toneStyle(r)}"><div class="dest">${esc(r.dest)}</div></div>
    <div class="grow">
      <div class="kicker">${range(r)} · ${nights(r)}</div>
      <h1>${esc(r.name)}</h1>
      <div class="meta"><span class="avs">${r.members.map((m) => av(m, 24)).join('')}</span><span>${r.members.length}명</span>${syncPill(r)}${me ? `<span class="sep"></span><button class="link" data-act="pick-me" style="color:var(--muted);font-weight:500;text-decoration:none">${esc(me.name)}(으)로 참여 중 <span style="color:var(--accent)">변경</span></button>` : ''}</div>
    </div>
    <div class="right">
      ${r.demo ? '' : `<div class="dday">${dday(r)}</div>`}
      <button class="btn pri sm share-d" data-act="share">${I('share', 16)}초대 · 공유</button>
    </div>
  </section>
  ${r.demo ? `<div class="notice"><span><b>예시 여행방</b>이에요. 마음껏 눌러보세요 — 변경은 이 기기에만 저장돼요.</span><span class="sp"></span><button class="btn sm" data-act="fork-demo">이 내용으로 내 여행 만들기</button><button class="btn sm ghost" data-act="reset-demo">처음으로</button></div>` : ''}
  ${shared(r) && S.sync[r.id].needPass ? passGate(r) : ({ chat: chatTab, places: placesTab, plan: planTab, money: moneyTab, pack: packTab, journal: journalTab, docs: docsTab, room: settingsTab })[tab](r)}`;
}

// ───── 대화 ─────
function chatTab(r) {
  const me = meId(r);
  let html = '', prev = null, prevDay = '';
  r.messages.forEach((m) => {
    const d = new Date(m.at), dk = isoDate(d);
    if (dk !== prevDay) { html += `<div class="daydiv">${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일</div>`; prevDay = dk; prev = null; }
    if (m.sys) { html += `<div class="sysmsg">${esc(m.text)}</div>`; prev = null; return; }
    const first = !prev || prev.by !== m.by || m.at - prev.at > 5 * 6e4;
    const w = member(r, m.by), mine = m.by === me;
    html += `<div class="msg ${mine ? 'me' : ''} ${first ? 'first' : ''}">${mine ? '' : av(w, 30)}<div>${first && !mine ? `<div class="who">${esc(w.name)}</div>` : ''}<div class="bub">${esc(m.text)}</div></div><span class="t">${hm(m.at)}</span></div>`;
    prev = m;
  });
  return `<div class="sec"><div><h2>대화</h2><p>정할 것, 떠오른 생각을 가볍게 남겨요. 공유 링크를 주고받으면 함께 합쳐져요.</p></div></div>
  <div class="card chat"><div class="msgs">${html || empty('chat', '첫 마디를 남겨보세요', '어디 가고 싶은지, 언제가 좋은지부터 이야기해요.')}</div>
  <form class="composer" data-form="chat"><input type="text" name="t" placeholder="메시지 보내기" autocomplete="off" maxlength="500" aria-label="메시지"><button class="btn pri icon" aria-label="보내기">${I('send')}</button></form></div>`;
}

// ───── 모아둔 곳 ─────
function placesTab(r) {
  let list = r.places.slice();
  if (ui.filter === 'none') list = list.filter((p) => !p.day);
  else if (ui.filter !== 'all') list = list.filter((p) => p.cat === ui.filter);
  const q = ui.q.trim().toLowerCase();
  if (q) list = list.filter((p) => `${p.name} ${p.addr || ''} ${p.memo || ''} ${member(r, p.by).name}`.toLowerCase().includes(q));
  list.sort(ui.sort === 'heart' ? (a, b) => b.hearts.length - a.hearts.length || b.at - a.at : (a, b) => b.at - a.at);
  const wide = isWide(), showMap = wide || ui.view === 'map', showList = wide || ui.view === 'list';
  const pv = provider(r);
  return `<div class="sec"><div><h2>우리의 가고 싶은 곳</h2><p>누구의 제안이든 좋아요. 마음에 들면 하트를 눌러주세요.</p></div>
    <div class="acts"><button class="btn pri" data-act="add-place">${I('plus')}장소 제안</button></div></div>
  ${r.places.length > 3 ? `<div class="input-wrap" style="margin-bottom:12px">${I('search', 16)}<input type="search" data-q value="${esc(ui.q)}" placeholder="모아둔 곳에서 찾기 — 이름, 주소, 한마디, 제안한 사람" aria-label="모아둔 곳 검색"></div>` : ''}
  <div class="toolbar">
    <div class="chips" role="tablist">
      <button class="chip ${ui.filter === 'all' ? 'on' : ''}" data-act="filter" data-k="all">전체 ${r.places.length}</button>
      <button class="chip ${ui.filter === 'none' ? 'on' : ''}" data-act="filter" data-k="none">날짜 미정</button>
      ${CATS.filter((c) => r.places.some((p) => p.cat === c.k)).map((c) => `<button class="chip ${ui.filter === c.k ? 'on' : ''}" data-act="filter" data-k="${c.k}"><span class="dot" style="--c:${c.c}"></span>${c.n}</button>`).join('')}
    </div>
    <div class="row">
      ${showList ? `<div class="seg"><button class="${ui.sort === 'new' ? 'on' : ''}" data-act="sort" data-k="new">최신</button><button class="${ui.sort === 'heart' ? 'on' : ''}" data-act="sort" data-k="heart">${I('heart', 14, 2)}인기</button></div>` : ''}
      ${wide ? '' : `<div class="seg"><button class="${ui.view === 'list' ? 'on' : ''}" data-act="view" data-k="list" aria-label="목록">${I('list', 16)}</button><button class="${ui.view === 'map' ? 'on' : ''}" data-act="view" data-k="map" aria-label="지도">${I('map', 16)}</button></div>`}
    </div>
  </div>
  <div class="places-layout ${wide ? 'split' : ''}">
    ${showList ? `<div class="plist">${list.length ? list.map((p) => placeCard(r, p)).join('') : r.places.length ? empty('search', '조건에 맞는 장소가 없어요', '다른 분류를 골라보세요.') : empty('pin', '아직 모아둔 곳이 없어요', `${PNAME[pv]}에서 검색해서 가고 싶은 곳을 제안해보세요.`, `<button class="btn pri" data-act="add-place">${I('plus')}첫 장소 제안하기</button>`)}
      <p class="faint" style="text-align:center;font-size:13px;margin:12px 0 0">하트는 순위를 정하는 참고예요. 최종 일정은 함께 이야기해서 정해요.</p></div>` : ''}
    ${showMap ? `<div>
      <div class="${wide ? 'map-pane' : 'map-mobile'}"><div id="map-slot"></div></div>
      <div class="row faint" style="font-size:12px;margin-top:8px;gap:6px">${I('map', 14)}<span class="map-src">${PNAME[pv]}</span><span>· 숫자는 일정 순서, 작은 점은 날짜 미정</span></div>
      ${wide ? '' : `<div id="map-sel" style="margin-top:12px">${ui.sel && r.places.find((x) => x.id === ui.sel) ? placeCard(r, r.places.find((x) => x.id === ui.sel)) : ''}</div>`}
    </div>` : ''}
  </div>`;
}
function placeCard(r, p) {
  const c = cat(p.cat), by = member(r, p.by), me = meId(r), on = p.hearts.includes(me), open = ui.openCmt[p.id];
  const days = dayCount(r);
  return `<article class="place" data-pid="${p.id}" data-s="${esc(`${p.name} ${p.addr || ''} ${p.memo || ''} ${by.name}`.toLowerCase())}">
    <div class="place-meta"><span class="dot" style="--c:${c.c}"></span><span>${c.n}</span><span>·</span>${av(by, 18)}<span>${esc(by.name)}</span>${p.day ? `<span class="sp"></span>${p.visited ? '<span class="tag">다녀옴</span>' : ''}<span class="tag accent">${p.day}일차${p.time ? ' ' + p.time : ''}</span>` : ''}</div>
    <h3 class="place-name">${esc(p.name)}</h3>
    ${p.addr ? `<div class="place-addr">${esc(p.addr)}</div>` : ''}
    ${p.memo ? `<p class="place-memo">${esc(p.memo)}</p>` : ''}
    <div class="place-foot">
      <button class="heart ${on ? 'on' : ''}" data-act="heart" data-id="${p.id}" aria-pressed="${on}">${I('heart', 18, 1.8)}${p.hearts.length}</button>
      <span class="avs">${p.hearts.slice(0, 4).map((h) => av(member(r, h), 20)).join('')}</span>
      <span class="sp"></span>
      <button class="btn ghost sm" data-act="cmt" data-id="${p.id}">${I('chat', 16)}${p.comments.length || ''}</button>
      ${p.lat ? `<button class="btn ghost sm icon" data-act="locate" data-id="${p.id}" aria-label="지도에서 보기" title="지도에서 보기">${I('pin', 16)}</button>` : ''}
      <button class="btn ghost sm icon" data-act="place-menu" data-id="${p.id}" aria-label="더보기">${I('more', 18)}</button>
    </div>
    ${r.confirmed ? '' : `<div class="days-pick"><span class="lbl">언제 갈까요</span><div class="seg">
      <button class="${!p.day ? 'on' : ''}" data-act="set-day" data-id="${p.id}" data-d="0">미정</button>
      ${Array.from({ length: days }, (_, i) => `<button class="${p.day === i + 1 ? 'on' : ''}" data-act="set-day" data-id="${p.id}" data-d="${i + 1}">${i + 1}일차</button>`).join('')}
    </div></div>`}
    ${open ? `<div class="comments">
      ${p.comments.map((cm) => `<div class="cmt">${av(member(r, cm.by), 24)}<div class="grow"><b>${esc(member(r, cm.by).name)}</b> <span class="faint" style="font-size:12px">${timeAgo(cm.at)}</span><div>${esc(cm.text)}</div></div>${cm.by === me ? `<button class="btn ghost icon sm" data-act="del-cmt" data-id="${p.id}" data-c="${cm.id}" aria-label="의견 삭제">${I('x', 14)}</button>` : ''}</div>`).join('') || '<div class="faint" style="font-size:13px">아직 의견이 없어요. 첫 의견을 남겨보세요.</div>'}
      <form class="cmt-form" data-form="cmt" data-id="${p.id}"><input type="text" name="t" placeholder="의견 남기기" maxlength="300" aria-label="의견"><button class="btn pri sm">등록</button></form>
    </div>` : ''}
  </article>`;
}
function placeMenu(r, p) {
  const pv = provider(r);
  const a = (href, icon, label) => `<a href="${esc(href)}" target="_blank" rel="noopener">${I(icon)}${label}</a>`;
  const f = openModal({
    title: esc(p.name), raw: true,
    body: `<div class="menu">
      ${a(placeLink(r, p, pv), 'map', `${PNAME[pv]}에서 보기`)}
      ${a(navLink(r, p), 'nav', '길찾기')}
      ${pv === 'kakao' ? a(placeLink(r, p, 'naver'), 'ext', '네이버지도에서 보기') : a(placeLink(r, p, 'kakao'), 'ext', '카카오맵에서 보기')}
      ${p.url ? a(/^https?:/i.test(p.url) ? p.url : 'https://' + p.url, 'link', '참고 링크 열기') : ''}
      <hr>
      <button type="button" data-m="edit">${I('edit')}수정</button>
      <button type="button" data-m="copy">${I('copy')}이름·주소 복사</button>
      <button type="button" class="danger" data-m="del">${I('trash')}삭제</button>
    </div>`,
  });
  f.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]'); if (!b) { if (e.target.closest('a')) closeModal(); return; }
    closeModal();
    if (b.dataset.m === 'edit') placeModal(r, p);
    if (b.dataset.m === 'copy') copy(`${p.name}\n${p.addr || ''}`.trim());
    if (b.dataset.m === 'del') removeUndo(r, 'places', p.id, `'${p.name}'을(를)`);
  });
}
function placeModal(r, p) {
  const isNew = !p;
  p = p || { name: '', cat: 'spot', addr: '', memo: '', url: '', lat: null, lng: null };
  const pv = provider(r);
  let picked = { lat: p.lat, lng: p.lng, gid: p.gid, kid: p.kid };
  const form = openModal({
    title: isNew ? '가고 싶은 곳 제안하기' : '장소 수정',
    body: `
      <div class="field"><span>장소 검색 <small>· ${PNAME[mapKeys()[pv] && !failed[pv] ? pv : 'osm']}</small></span>
        <div class="row"><div class="input-wrap grow">${I('search', 16)}<input type="search" name="q" placeholder="${pv === 'kakao' ? `예: ${esc(r.dest)} 흑돼지, 성산일출봉` : `e.g. ${esc(r.dest)} ramen, 이치란`}" autocomplete="off" enterkeyhint="search"></div><button type="button" class="btn" data-search>검색</button></div>
      </div>
      <div class="results" aria-live="polite"></div>
      <label class="field"><span>이름</span><input type="text" name="name" required maxlength="60" value="${esc(p.name)}"></label>
      <div class="field"><span>분류</span><div class="chips" style="flex-wrap:wrap">${CATS.map((c) => `<label class="chip ${p.cat === c.k ? 'on' : ''}"><input type="radio" name="cat" value="${c.k}" ${p.cat === c.k ? 'checked' : ''}><span class="dot" style="--c:${c.c}"></span>${c.n}</label>`).join('')}</div></div>
      <label class="field"><span>주소</span><input type="text" name="addr" maxlength="140" value="${esc(p.addr)}"></label>
      <div class="row" style="margin-top:-8px;gap:6px"><div class="loc faint grow" style="font-size:12.5px;display:flex;align-items:center;gap:4px">${I('pin', 14)}${p.lat ? '지도 위치가 연결됐어요' : '검색하거나 지도에서 직접 고르면 표시돼요'}</div><button type="button" class="btn sm" data-pickmap>${I('map', 15)}지도에서 고르기</button></div>
      <div class="picker hidden"><div class="picker-map"></div><div class="faint" style="font-size:12px;margin-top:6px">지도를 눌러 위치를 찍으세요. 주소는 자동으로 채워져요.</div></div>
      <label class="field"><span>한마디 <small>· 왜 가고 싶은지</small></span><textarea name="memo" maxlength="300" placeholder="여기 노을이 진짜 예쁘대!">${esc(p.memo)}</textarea></label>
      <label class="field"><span>참고 링크 <small>· 인스타, 블로그 등</small></span><input type="url" name="url" value="${esc(p.url || '')}" placeholder="https://"></label>`,
    ok: isNew ? '제안하기' : '저장',
    onOk(f) {
      const d = Object.fromEntries(new FormData(f));
      const v = { name: d.name.trim(), cat: d.cat, addr: d.addr.trim(), memo: d.memo.trim(), url: d.url.trim(), ...picked };
      if (!v.name) return false;
      if (isNew) {
        const np = { id: uid(), ...v, by: meId(r), hearts: [meId(r)], comments: [], day: null, order: 0, time: '', at: now() };
        r.places.push(np); sysMsg(r, `${member(r, meId(r)).name}님이 '${v.name}'을(를) 모았어요`); touch(r, np);
        if (ui.filter !== 'all' && ui.filter !== v.cat && ui.filter !== 'none') ui.filter = 'all';
        toast('장소를 모았어요');
      } else { Object.assign(p, v); touch(r, p); toast('수정했어요'); }
      render();
    },
  });
  const box = $('.results', form);
  const doSearch = async () => {
    const q = form.q.value.trim(); if (!q) return;
    box.innerHTML = '<div class="hint">찾는 중…</div>';
    const res = await searchPlaces(q, r);
    if (!res.items.length) { box.innerHTML = `<div class="hint">${res.error ? '검색에 실패했어요.' : '검색 결과가 없어요.'} 이름·주소를 직접 적어도 괜찮아요.</div>`; return; }
    box.innerHTML = res.items.map((x, i) => `<button type="button" data-i="${i}"><span class="dot" style="--c:${cat(x.cat).c};margin-top:7px"></span><span class="grow"><b>${esc(x.name)}</b>${x.hint ? ` <span class="faint" style="font-size:12px">${esc(x.hint)}</span>` : ''}<br><span class="faint">${esc(x.addr)}</span></span></button>`).join('') + `<div class="hint" style="font-size:11.5px;padding:6px 12px">검색: ${PNAME[res.src]}</div>`;
    $$('button', box).forEach((b) => b.addEventListener('click', () => {
      const x = res.items[b.dataset.i];
      form.name.value = x.name; form.addr.value = x.addr || '';
      picked = { lat: +(+x.lat).toFixed(6), lng: +(+x.lng).toFixed(6), gid: x.gid, kid: x.kid };
      if (x.cat) { const rb = form.querySelector(`input[name=cat][value=${x.cat}]`); if (rb) { rb.checked = true; rb.dispatchEvent(new Event('change', { bubbles: true })); } }
      if (x.url && !form.url.value) form.url.value = x.url;
      $('.loc', form).innerHTML = `${I('check', 14, 2.2)}<span style="color:var(--accent)">지도 위치가 연결됐어요</span>`;
      box.innerHTML = ''; form.memo.focus();
    }));
  };
  const setLoc = () => { $('.loc', form).innerHTML = `${I('check', 14, 2.2)}<span style="color:var(--accent)">지도 위치가 연결됐어요</span>`; };
  $('[data-pickmap]', form).addEventListener('click', (e) => {
    const box = $('.picker', form);
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden'); e.currentTarget.classList.add('on');
    if (box.dataset.ready) return; box.dataset.ready = 1;
    mountPicker($('.picker-map', box), r, picked.lat ? [picked.lat, picked.lng] : null, async (lat, lng) => {
      picked = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }; setLoc();
      const a = await reverseAddr(lat, lng);
      if (a) form.addr.value = a;
      if (!form.name.value && a) form.name.value = a.split(' ').slice(-2).join(' ');
    });
  });
  $('[data-search]', form).addEventListener('click', doSearch);
  form.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
  if (!isNew) setTimeout(() => form.name.focus(), 50);
}

// ───── 일정 ─────
const sortPlan = (a, b) => (a.order || 0) - (b.order || 0) || (a.at || 0) - (b.at || 0);
function locked(r) { if (!r.confirmed) return false; toast('일정이 확정됐어요. 우리 일정에서 다시 열면 바꿀 수 있어요.'); return true; }
const dayItems = (r, d) => r.places.filter((p) => (d ? p.day === d : !p.day)).sort(sortPlan);
function reorderByTime(r, d) {
  const items = dayItems(r, d);
  const idx = items.map((p, i) => (p.time ? i : -1)).filter((i) => i >= 0);
  const timed = idx.map((i) => items[i]).sort((a, b) => a.time.localeCompare(b.time));
  idx.forEach((i, k) => (items[i] = timed[k]));
  items.forEach((p, k) => { p.order = k; p.upd = now(); });
}
function placeInDay(r, p, d, index) {
  const items = d ? dayItems(r, d).filter((x) => x !== p) : [];
  p.day = d || null;
  if (d) { items.splice(index ?? items.length, 0, p); items.forEach((x, k) => { x.order = k; x.upd = now(); }); }
  touch(r, p);
}
function planTab(r) {
  const days = dayCount(r), pending = dayItems(r, 0).sort((a, b) => b.hearts.length - a.hearts.length);
  const lock = !!r.confirmed, planned = r.places.filter((p) => p.day), visited = planned.filter((p) => p.visited).length;
  return `<div class="sec"><div><h2>우리 일정</h2><p>${lock ? '확정된 일정이에요. 다녀온 곳은 체크해 보세요.' : '모아둔 곳을 날짜에 끌어다 놓고, 순서와 시간을 맞춰요.'}</p></div>
    <div class="acts"><button class="btn" data-act="copy-plan">${I('copy', 16)}단체톡용 복사</button>${lock ? '' : `<button class="btn pri" data-act="confirm-plan" ${planned.length ? '' : 'disabled style="opacity:.5"'}>${I('check', 16, 2.2)}일정 확정</button>`}</div></div>
  ${lock ? `<div class="locked">${I('check', 18, 2.2)}<span><b>일정 확정</b> · ${esc(member(r, r.confirmed.by).name)}님이 ${timeAgo(r.confirmed.at)} 확정했어요</span><span class="faint">다녀온 곳 ${visited}/${planned.length}</span><span class="sp"></span><button class="btn sm" data-act="reopen-plan">다시 열기</button></div>` : ''}
  <div class="days">
  ${Array.from({ length: days }, (_, i) => {
    const d = i + 1, items = dayItems(r, d), col = COLORS[i % COLORS.length];
    return `<section class="day" data-drop="${d}">
      <div class="day-head"><span class="day-no" style="color:${col}">${d}일차</span><span class="day-date">${dayLabel(r, d)}</span><span class="sp"></span>
        ${items.length > 1 ? `<a class="btn ghost sm" href="${esc(routeUrl(r, items))}" target="_blank" rel="noopener" title="${PNAME[provider(r)]} 경로">${I('route', 16)}경로</a>` : ''}</div>
      ${items.length ? `<ol class="stops">${items.map((p, j) => `<li class="stop ${p.visited ? 'visited' : ''}" ${lock ? '' : `draggable="true" data-drag="${p.id}"`} style="--c:${col}">
        <span class="stop-no">${j + 1}</span>
        <div class="grow"><div class="stop-name"><span class="dot" style="--c:${cat(p.cat).c}"></span>${esc(p.name)}</div>
          <div class="stop-sub"><input type="time" value="${p.time || ''}" data-change="time" data-id="${p.id}" aria-label="${esc(p.name)} 시간" ${lock ? 'disabled' : ''}>${p.hearts.length ? `<span class="faint" style="font-size:12px">♥ ${p.hearts.length}</span>` : ''}</div></div>
        ${lock ? `<button class="visit ${p.visited ? 'on' : ''}" data-act="visit" data-id="${p.id}" aria-pressed="${!!p.visited}" aria-label="${esc(p.name)} 다녀왔어요" title="다녀왔어요">${I('check', 15, 2.6)}</button>`
          : `<div class="stop-ctrl"><button data-act="visit" data-id="${p.id}" aria-label="다녀왔어요 표시" title="다녀왔어요">${I('check', 16)}</button><button data-act="move" data-id="${p.id}" data-dir="-1" aria-label="위로">${I('up', 16)}</button><button data-act="move" data-id="${p.id}" data-dir="1" aria-label="아래로">${I('down', 16)}</button><button data-act="set-day" data-id="${p.id}" data-d="0" aria-label="일정에서 빼기">${I('x', 16)}</button></div>`}
      </li>`).join('')}</ol>` : `<div class="day-empty">${lock ? '이 날은 비어 있어요' : '여기로 장소를 끌어다 놓거나<br>아래에서 골라 넣어요'}</div>`}
      ${pending.length && !lock ? `<div class="day-add"><select data-change="assign" data-d="${d}" aria-label="${d}일차에 장소 추가"><option value="">＋ 모아둔 곳에서 추가</option>${pending.map((p) => `<option value="${p.id}">${esc(p.name)}${p.hearts.length ? ` ♥${p.hearts.length}` : ''}</option>`).join('')}</select></div>` : ''}
    </section>`;
  }).join('')}
  </div>
  ${lock && !pending.length ? '' : lock ? `<section class="tray"><div class="row"><h3>일정에 들지 않은 후보</h3><span class="faint">${pending.length}곳</span></div><div class="tray-items">${pending.map((p) => `<span class="tray-item" style="cursor:default;padding-right:12px"><span class="dot" style="--c:${cat(p.cat).c}"></span>${esc(p.name)}</span>`).join('')}</div></section>` : `<section class="tray" data-drop="0">
    <div class="row"><h3>아직 날짜 미정</h3><span class="faint">${pending.length}곳</span><span class="sp"></span><span class="faint" style="font-size:12px">하트 많은 순</span></div>
    ${pending.length ? `<div class="tray-items">${pending.map((p) => `<span class="tray-item" draggable="true" data-drag="${p.id}"><span class="dot" style="--c:${cat(p.cat).c}"></span>${esc(p.name)}${p.hearts.length ? ` <span class="faint">♥${p.hearts.length}</span>` : ''}
      <select data-change="assign-one" data-id="${p.id}" aria-label="${esc(p.name)} 날짜"><option value="">날짜</option>${Array.from({ length: days }, (_, i) => `<option value="${i + 1}">${i + 1}일차</option>`).join('')}</select></span>`).join('')}</div>`
      : `<p class="faint" style="margin:8px 0 0;font-size:14px">모든 장소가 일정에 들어갔어요. 일정에서 빼려면 여기로 끌어다 놓으세요.</p>`}
  </section>`}`;
}
function planText(r) {
  let t = `✈️ ${r.name}\n📍 ${r.dest} · ${range(r)} (${nights(r)})\n`;
  for (let d = 1; d <= dayCount(r); d++) {
    const items = dayItems(r, d);
    t += `\n[${d}일차 · ${dayLabel(r, d)}]\n` + (items.map((p, i) => `${i + 1}. ${p.time ? p.time + ' ' : ''}${p.name}`).join('\n') || '- 아직 미정');
  }
  const pend = dayItems(r, 0);
  if (pend.length) t += `\n\n💭 후보: ${pend.map((p) => p.name).join(', ')}`;
  return t + '\n\n— 모아여행에서 함께 만든 일정';
}

// ───── 정산 ─────
function settle(r) {
  const bal = {}; r.members.forEach((m) => (bal[m.id] = 0));
  r.expenses.forEach((e) => {
    const split = e.split.filter((id) => id in bal); if (!split.length) return;
    if (e.payer in bal) bal[e.payer] += e.amount;
    split.forEach((id) => (bal[id] -= e.amount / split.length));
  });
  const cred = [], debt = [];
  Object.entries(bal).forEach(([id, v]) => { if (v > 0.5) cred.push([id, v]); else if (v < -0.5) debt.push([id, -v]); });
  cred.sort((a, b) => b[1] - a[1]); debt.sort((a, b) => b[1] - a[1]);
  const tx = []; let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const amt = Math.min(debt[i][1], cred[j][1]);
    tx.push({ from: debt[i][0], to: cred[j][0], amt: Math.round(amt / 10) * 10 });
    debt[i][1] -= amt; cred[j][1] -= amt;
    if (debt[i][1] < 0.5) i++;
    if (cred[j][1] < 0.5) j++;
  }
  return { bal, tx };
}
function moneyTab(r) {
  const total = r.expenses.reduce((s, e) => s + e.amount, 0);
  const { bal, tx } = settle(r), me = meId(r);
  const mine = r.expenses.reduce((s, e) => s + (e.split.includes(me) ? e.amount / e.split.length : 0), 0);
  const byCat = ECATS.map((c) => [c, r.expenses.filter((e) => e.cat === c.k).reduce((s, e) => s + e.amount, 0)]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]);
  if (!r.expenses.length) {
    return `<div class="sec"><div><h2>함께 쓴 돈</h2><p>누가 냈는지만 적으면, 누가 누구에게 얼마 보낼지 계산해 드려요.</p></div></div>
    <div class="card">${empty('wallet', '아직 기록된 지출이 없어요', '항공권, 숙소처럼 미리 낸 돈부터 적어보세요.', `<button class="btn pri" data-act="add-exp">${I('plus')}첫 지출 기록</button>`)}</div>`;
  }
  return `<div class="sec"><div><h2>함께 쓴 돈</h2><p>누가 냈는지만 적으면, 누가 누구에게 얼마 보낼지 계산해 드려요.</p></div>
    <div class="acts"><button class="btn pri" data-act="add-exp">${I('plus')}지출 추가</button></div></div>
  <div class="card">
    <div class="stats"><div><div class="k">총 지출</div><div class="v">${won(total)}</div></div><div><div class="k">1인 평균</div><div class="v">${won(total / Math.max(1, r.members.length))}</div></div><div><div class="k">내 몫</div><div class="v">${won(mine)}</div></div></div>
    <div style="padding:0 20px 18px"><div class="bar">${byCat.map(([c, v]) => `<i title="${c.n} ${won(v)}" style="width:${(v / total) * 100}%;background:${c.c}"></i>`).join('')}</div>
    <div class="legend">${byCat.map(([c, v]) => `<span class="row" style="gap:6px"><span class="dot" style="--c:${c.c}"></span>${c.n} <b>${won(v)}</b></span>`).join('')}</div></div>
  </div>
  <div class="two">
    <div>
      <div class="sec"><div><h2>이렇게 보내면 끝</h2><p>송금 횟수가 가장 적게 계산했어요.</p></div>${tx.length ? `<div class="acts"><button class="btn sm" data-act="copy-settle">${I('copy', 15)}복사</button></div>` : ''}</div>
      <div class="card rows">${tx.length ? tx.map((t) => `<div class="r">${av(member(r, t.from), 28)}<b>${esc(member(r, t.from).name)}</b><span class="arrow">→</span>${av(member(r, t.to), 28)}<b class="grow">${esc(member(r, t.to).name)}</b><span class="amt">${won(t.amt)}</span></div>`).join('') : '<div class="r muted">모두 정산 완료! 보낼 돈이 없어요.</div>'}</div>
      <div class="sec"><div><h2>사람별</h2></div></div>
      <div class="card rows">${r.members.map((m) => { const paid = r.expenses.filter((e) => e.payer === m.id).reduce((s, e) => s + e.amount, 0); const b = bal[m.id] || 0;
        return `<div class="r">${av(m, 28)}<div class="grow"><b>${esc(m.name)}</b><div class="faint" style="font-size:12px">낸 돈 ${won(paid)} · 내 몫 ${won(paid - b)}</div></div><span class="amt ${b > 0.5 ? 'pos' : b < -0.5 ? 'neg' : 'faint'}">${b > 0.5 ? '받을 돈 ' : b < -0.5 ? '보낼 돈 ' : ''}${won(Math.abs(b))}</span></div>`; }).join('')}</div>
    </div>
    <div>
      <div class="sec"><div><h2>지출 내역</h2><p>${r.expenses.length}건 · 눌러서 수정</p></div></div>
      <div class="card rows">${r.expenses.slice().sort((a, b) => b.at - a.at).map((e) => `<button class="r" data-act="edit-exp" data-id="${e.id}"><span class="dot" style="--c:${ecat(e.cat).c}"></span><div class="grow"><b>${esc(e.title)}</b>${e.photos?.length ? ` <span class="faint" title="영수증 ${e.photos.length}장" style="display:inline-flex;vertical-align:-3px">${I('clip', 15)}</span>` : ''}<div class="faint" style="font-size:12px">${ecat(e.cat).n} · ${esc(member(r, e.payer).name)} 결제 · ${e.split.length}명</div></div><div style="text-align:right"><div class="amt">${won(e.amount)}</div><div class="faint num" style="font-size:12px">1인 ${won(e.amount / Math.max(1, e.split.length))}</div></div></button>`).join('')}</div>
    </div>
  </div>`;
}
function expModal(r, e) {
  const isNew = !e;
  e = e || { title: '', amount: '', cat: 'food', payer: meId(r), split: r.members.map((m) => m.id) };
  const form = openModal({
    title: isNew ? '지출 기록' : '지출 수정',
    body: `<label class="field"><span>금액</span><input class="amount-input num" type="text" name="amount" required inputmode="numeric" autocomplete="off" value="${e.amount ? Number(e.amount).toLocaleString('ko-KR') : ''}" placeholder="0원"></label>
      <div class="faint per" style="font-size:13px;margin-top:-8px"></div>
      <label class="field"><span>무엇에 썼나요</span><input type="text" name="title" required maxlength="60" value="${esc(e.title)}" placeholder="예: 흑돼지 저녁"></label>
      <div class="field"><span>분류</span><div class="chips" style="flex-wrap:wrap">${ECATS.map((c) => `<label class="chip ${e.cat === c.k ? 'on' : ''}"><input type="radio" name="cat" value="${c.k}" ${e.cat === c.k ? 'checked' : ''}><span class="dot" style="--c:${c.c}"></span>${c.n}</label>`).join('')}</div></div>
      <div class="field"><span>누가 냈나요</span><div class="chips" style="flex-wrap:wrap">${r.members.map((m) => `<label class="chip ${e.payer === m.id ? 'on' : ''}"><input type="radio" name="payer" value="${m.id}" ${e.payer === m.id ? 'checked' : ''}>${esc(m.name)}</label>`).join('')}</div></div>
      <div class="field"><span>누구와 나누나요</span><div class="chips" style="flex-wrap:wrap">${r.members.map((m) => `<label class="chip ${e.split.includes(m.id) ? 'on' : ''}"><input type="checkbox" name="split" value="${m.id}" ${e.split.includes(m.id) ? 'checked' : ''}>${esc(m.name)}</label>`).join('')}</div></div>
      <div class="field"><span>영수증 사진 <small>· 선택</small></span>
        ${e.photos?.length ? `<div class="photos" style="margin:0">${e.photos.map((x) => ph(x, '영수증')).join('')}</div>` : ''}
        <input type="file" name="files" accept="image/*" multiple style="height:auto;padding:10px"></div>
      ${isNew ? '' : `<button type="button" class="btn sm ghost danger" data-del style="align-self:flex-start">${I('trash', 15)}이 지출 삭제</button>`}`,
    ok: isNew ? '기록하기' : '저장',
    onOk(f) {
      const fd = new FormData(f), split = fd.getAll('split');
      const amount = +String(fd.get('amount')).replace(/[^\d]/g, '');
      if (!amount) { toast('금액을 적어주세요'); return false; }
      if (!split.length) { toast('나눌 사람을 한 명 이상 골라주세요'); return false; }
      const v = { title: fd.get('title').trim(), amount, cat: fd.get('cat'), payer: fd.get('payer'), split };
      const files = fd.getAll('files').filter((x) => x.size).slice(0, 4);
      const done = (photos) => {
        v.photos = [...(e.photos || []), ...photos];
        if (isNew) { const ne = { id: uid(), ...v, at: now() }; r.expenses.push(ne); touch(r, ne); } else { Object.assign(e, v); touch(r, e); }
        toast('기록했어요'); render();
      };
      if (files.length) { toast('영수증을 올리는 중…'); Promise.all(files.map((x) => shrink(x, 1600, 0.82))).then((l) => uploadPhotos(r, l.filter(Boolean))).then(done); } else done([]);
    },
  });
  hydratePhotos();
  const amt = form.amount, per = $('.per', form);
  const upd = () => {
    const n = +amt.value.replace(/[^\d]/g, ''); const k = $$('input[name=split]:checked', form).length;
    per.textContent = n && k ? `${k}명이 나누면 1인 ${won(n / k)}` : '';
  };
  amt.addEventListener('input', () => { const n = amt.value.replace(/[^\d]/g, ''); amt.value = n ? (+n).toLocaleString('ko-KR') : ''; upd(); });
  form.addEventListener('change', upd); upd();
  $('[data-del]', form)?.addEventListener('click', () => { closeModal(); removeUndo(r, 'expenses', e.id, `'${e.title}' 지출을`); });
}

// ───── 준비물 ─────
function packTab(r) {
  const me = meId(r), done = r.checklist.filter((c) => c.done).length, all = r.checklist.length;
  const groups = [{ id: null, name: '공용' }, ...r.members].map((g) => ({ g, items: r.checklist.filter((c) => (c.who || null) === g.id).sort((a, b) => a.done - b.done) })).filter((x) => x.items.length);
  groups.sort((a, b) => (b.g.id === me) - (a.g.id === me));
  return `<div class="sec"><div><h2>준비물</h2><p>누가 뭘 챙길지 정해두면 겹치지도, 빠뜨리지도 않아요.</p></div>
    ${all < 3 ? `<div class="acts"><button class="btn" data-act="pack-template">기본 준비물 넣기</button></div>` : ''}</div>
  <div class="card" style="padding:18px 18px 16px">
    <div class="row" style="margin-bottom:10px"><b class="num">${done} / ${all}</b><span class="muted" style="font-size:14px">챙겼어요</span><span class="sp"></span><span class="faint num">${all ? Math.round((done / all) * 100) : 0}%</span></div>
    <div class="progress"><i style="width:${all ? (done / all) * 100 : 0}%"></i></div>
    <form class="row" data-form="pack" style="margin-top:16px"><input type="text" name="t" placeholder="챙길 것 추가" maxlength="60" class="grow" aria-label="준비물"><select name="who" style="width:auto;flex:none" aria-label="담당"><option value="">공용</option>${r.members.map((m) => `<option value="${m.id}" ${m.id === me ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select><button class="btn pri icon" aria-label="추가">${I('plus')}</button></form>
  </div>
  ${groups.length ? `<div class="card" style="margin-top:16px;padding-bottom:4px">${groups.map(({ g, items }) => `<div class="group-h">${g.id ? av(g, 20) : ''}${esc(g.name)}${g.id === me ? ' (나)' : ''}<span class="faint" style="font-weight:500">${items.filter((c) => c.done).length}/${items.length}</span></div>
    ${items.map((c) => `<div class="check ${c.done ? 'done' : ''}" data-act="pack-toggle" data-id="${c.id}" role="checkbox" aria-checked="${!!c.done}" tabindex="0"><span class="box">${I('check', 14, 2.6)}</span><span class="t grow">${esc(c.text)}</span><button class="btn ghost icon sm x" data-act="pack-del" data-id="${c.id}" aria-label="삭제">${I('x', 14)}</button></div>`).join('')}`).join('')}</div>`
    : `<div class="card" style="margin-top:16px">${empty('checks', '아직 비어 있어요', '자주 챙기는 것들을 한 번에 넣어볼까요?', `<button class="btn" data-act="pack-template">기본 준비물 넣기</button>`)}</div>`}`;
}

// ───── 티켓·서류 보관함 ─────
const DKINDS = [
  { k: 'air', n: '항공권', c: '#3b82f6' }, { k: 'stay', n: '숙소 예약', c: '#0fa37a' }, { k: 'ticket', n: '입장권·티켓', c: '#f2a100' },
  { k: 'move', n: '교통', c: '#14b8a6' }, { k: 'receipt', n: '영수증', c: '#ff6a47' }, { k: 'etc', n: '기타', c: '#94a3b8' },
];
const dkind = (k) => DKINDS.find((x) => x.k === k) || DKINDS[5];
function docsTab(r) {
  const list = (r.docs || []).slice().sort((a, b) => (a.day || 99) - (b.day || 99) || (b.at || 0) - (a.at || 0));
  const receipts = r.expenses.filter((e) => e.photos?.length);
  return `<div class="sec"><div><h2>티켓 · 서류</h2><p>항공권, 숙소 예약, 입장권 캡처를 한곳에. ${shared(r) ? '일행 모두가 함께 봐요.' : '함께 보는 여행방으로 열면 일행도 볼 수 있어요.'}</p></div>
    <div class="acts"><button class="btn pri" data-act="add-doc">${I('plus')}올리기</button></div></div>
  ${list.length ? `<div class="docs">${list.map((d) => { const k = dkind(d.kind), w = member(r, d.by); return `<button class="doc" data-act="open-doc" data-id="${d.id}">
      <div class="doc-thumb">${d.photos?.[0] ? ph(d.photos[0], esc(d.title)) : `<span class="ill">${I('ticket', 28, 1.4)}</span>`}${d.photos?.length > 1 ? `<span class="more">+${d.photos.length - 1}</span>` : ''}</div>
      <div class="doc-body"><div class="row" style="gap:6px"><span class="dot" style="--c:${k.c}"></span><span class="faint" style="font-size:12px">${k.n}</span>${d.day ? `<span class="sp"></span><span class="tag accent">${d.day}일차</span>` : ''}</div>
        <b>${esc(d.title)}</b>${d.note ? `<div class="faint ellip1">${esc(d.note)}</div>` : ''}<div class="row faint" style="gap:5px;font-size:12px;margin-top:2px">${av(w, 16)}${esc(w.name)}</div></div></button>`; }).join('')}</div>`
    : `<div class="card">${empty('ticket', '아직 올린 서류가 없어요', '예약 확인 화면이나 티켓을 캡처해서 올려두면, 현장에서 바로 꺼내 볼 수 있어요.', `<button class="btn pri" data-act="add-doc">${I('plus')}첫 서류 올리기</button>`)}</div>`}
  ${receipts.length ? `<div class="sec"><div><h2>정산 영수증</h2><p>지출에 붙인 영수증이에요.</p></div></div>
    <div class="card rows">${receipts.map((e) => `<button class="r" data-act="edit-exp" data-id="${e.id}">${I('clip', 16)}<b class="grow">${esc(e.title)}</b><span class="faint" style="font-size:12px">${e.photos.length}장</span><span class="amt">${won(e.amount)}</span></button>`).join('')}</div>` : ''}`;
}
function docModal(r) {
  openModal({
    title: '티켓 · 서류 올리기',
    body: `<label class="field"><span>사진 <small>· 캡처 화면도 좋아요, 최대 6장</small></span><input type="file" name="files" accept="image/*" multiple required style="height:auto;padding:10px"></label>
      <label class="field"><span>이름</span><input type="text" name="title" required maxlength="60" placeholder="예: 제주항공 왕복 e티켓"></label>
      <div class="field"><span>종류</span><div class="chips" style="flex-wrap:wrap">${DKINDS.map((k, i) => `<label class="chip ${i === 0 ? 'on' : ''}"><input type="radio" name="kind" value="${k.k}" ${i === 0 ? 'checked' : ''}><span class="dot" style="--c:${k.c}"></span>${k.n}</label>`).join('')}</div></div>
      <label class="field"><span>언제 쓰나요 <small>· 선택</small></span><select name="day"><option value="">날짜 없음</option>${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}">${i + 1}일차 · ${dayLabel(r, i + 1)}</option>`).join('')}</select></label>
      <label class="field"><span>메모 <small>· 예약번호, 체크인 시간 등</small></span><textarea name="note" maxlength="300" style="min-height:70px"></textarea></label>`,
    ok: '올리기',
    onOk(f) {
      const fd = new FormData(f), files = fd.getAll('files').filter((x) => x.size).slice(0, 6);
      if (!files.length) { toast('사진을 골라주세요'); return false; }
      toast(shared(r) ? '올리는 중…' : '저장하는 중…');
      Promise.all(files.map((x) => shrink(x, 1600, 0.82))).then((l) => uploadPhotos(r, l.filter(Boolean))).then((photos) => {
        const d = { id: uid(), title: fd.get('title').trim(), kind: fd.get('kind'), day: +fd.get('day') || null, note: fd.get('note').trim(), photos, by: meId(r), at: now() };
        r.docs.push(d); touch(r, d); render(); toast('보관함에 넣었어요');
      });
    },
  });
}
function docView(r, d) {
  const k = dkind(d.kind);
  const f = openModal({
    title: esc(d.title),
    body: `<div class="row wrap" style="gap:8px"><span class="tag"><span class="dot" style="--c:${k.c}"></span>${k.n}</span>${d.day ? `<span class="tag accent">${d.day}일차 · ${dayLabel(r, d.day)}</span>` : ''}<span class="faint" style="font-size:12px">${esc(member(r, d.by).name)} · ${timeAgo(d.at)}</span></div>
      ${d.note ? `<p style="margin:0;white-space:pre-wrap">${esc(d.note)}</p>` : ''}
      <div class="doc-full">${(d.photos || []).map((x) => ph(x, esc(d.title))).join('') || '<p class="faint">사진이 없어요</p>'}</div>
      <button type="button" class="btn sm ghost danger" data-del style="align-self:flex-start">${I('trash', 15)}삭제</button>`,
  });
  hydratePhotos();
  $('[data-del]', f).addEventListener('click', () => { closeModal(); removeUndo(r, 'docs', d.id, `'${d.title}'을(를)`); });
}

// ───── 기록 ─────
function journalTab(r) {
  const days = [...new Set(r.journal.map((j) => j.day))].sort((a, b) => a - b);
  return `<div class="sec"><div><h2>여행 기록</h2><p>그날의 기분과 사진을 남겨요. ${shared(r) ? '사진도 일행 모두가 함께 봐요.' : '사진은 이 기기에만 저장돼요.'}</p></div>
    <div class="acts"><button class="btn pri" data-act="add-entry">${I('plus')}기록 남기기</button></div></div>
  ${days.length ? days.map((d) => `<section class="jday"><div class="d"><div class="n">${d}일차</div><div class="faint" style="font-size:13px">${dayLabel(r, d)}</div></div><div>
    ${r.journal.filter((j) => j.day === d).sort((a, b) => (a.upd || 0) - (b.upd || 0)).map((j) => { const w = member(r, j.by); return `<article class="card entry">
      <div class="row"><span class="mood">${j.mood}</span>${av(w, 22)}<b style="font-size:14px">${esc(w.name)}</b><span class="sp"></span>${j.by === meId(r) ? `<button class="btn ghost icon sm" data-act="del-entry" data-id="${j.id}" aria-label="삭제">${I('trash', 15)}</button>` : ''}</div>
      <p>${esc(j.text)}</p>
      ${j.photos?.filter(Boolean).length ? `<div class="photos">${j.photos.filter(Boolean).map((src) => ph(src)).join('')}</div>` : ''}
    </article>`; }).join('')}</div></section>`).join('')
    : `<div class="card">${empty('camera', '여행이 시작되면 하루하루를 남겨보세요', '오늘의 기분, 좋았던 순간, 사진 몇 장이면 충분해요.', `<button class="btn pri" data-act="add-entry">${I('plus')}첫 기록 남기기</button>`)}</div>`}`;
}
function entryModal(r) {
  const today = isoDate(new Date());
  const cur = Math.min(dayCount(r), Math.max(1, Math.round((new Date(today) - new Date(r.start)) / 864e5) + 1));
  openModal({
    title: '오늘의 기록',
    body: `<label class="field"><span>날짜</span><select name="day">${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}" ${i + 1 === cur ? 'selected' : ''}>${i + 1}일차 · ${dayLabel(r, i + 1)}</option>`).join('')}</select></label>
      <div class="field"><span>오늘의 기분</span><div class="chips">${MOODS.map((m, i) => `<label class="chip ${i === 0 ? 'on' : ''}" style="font-size:20px;height:42px;padding:0 12px"><input type="radio" name="mood" value="${m}" ${i === 0 ? 'checked' : ''}>${m}</label>`).join('')}</div></div>
      <label class="field"><span>어땠나요</span><textarea name="text" required maxlength="1000" placeholder="오늘 가장 좋았던 순간은?"></textarea></label>
      <label class="field"><span>사진 <small>· 최대 4장</small></span><input type="file" name="photos" accept="image/*" multiple style="height:auto;padding:10px"></label>`,
    ok: '남기기',
    onOk(f) {
      const fd = new FormData(f);
      const files = fd.getAll('photos').filter((x) => x.size).slice(0, 4);
      if (files.length) toast(shared(r) ? '사진을 올리는 중…' : '사진을 줄이는 중…');
      Promise.all(files.map(shrink)).then((list) => uploadPhotos(r, list.filter(Boolean))).then((photos) => {
        const j = { id: uid(), day: +fd.get('day'), mood: fd.get('mood'), text: fd.get('text').trim(), photos, by: meId(r) };
        r.journal.push(j); touch(r, j); render(); toast('기록했어요');
      });
    },
  });
}
function shrink(file, max = 900, q = 0.75) {
  return new Promise((res) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = () => res('');
    img.src = url;
  });
}

// ───── 설정 ─────
function settingsTab(r) {
  const k = mapKeys(), pv = provider(r);
  return `<div class="sec"><div><h2>여행방 설정</h2><p>기본 정보, 일행, 지도와 공유를 관리해요.</p></div></div>
  <div class="group-title">기본 정보</div>
  <form class="group" data-form="room" style="padding:18px;display:flex;flex-direction:column;gap:14px">
    <label class="field"><span>여행 이름</span><input type="text" name="name" required maxlength="40" value="${esc(r.name)}"></label>
    <label class="field"><span>여행지</span><input type="text" name="dest" maxlength="30" value="${esc(r.dest)}"></label>
    <div class="grid2"><label class="field"><span>출발</span><input type="date" name="start" required value="${r.start}"></label><label class="field"><span>도착</span><input type="date" name="end" required value="${r.end}"></label></div>
    <div class="field"><span>커버 색</span><div class="tones">${TONES.map((t, i) => `<label class="tone ${tone(r) === t ? 'on' : ''}" style="--tone:${t[0]}"><input type="radio" name="tone" value="${i}" ${tone(r) === t ? 'checked' : ''} aria-label="색 ${i + 1}"></label>`).join('')}</div></div>
    <div><button class="btn pri">저장</button></div>
  </form>

  <div class="group-title">일행 · ${r.members.length}명</div>
  <div class="group">
    ${r.members.map((m) => `<div class="item">${av(m, 30)}<b class="grow">${esc(m.name)}${m.id === meId(r) ? ' <span class="tag accent">나</span>' : ''}</b><button class="btn ghost sm" data-act="rename-mem" data-id="${m.id}">이름 변경</button>${r.members.length > 1 ? `<button class="btn ghost sm danger" data-act="del-mem" data-id="${m.id}">내보내기</button>` : ''}</div>`).join('')}
    <form class="item" data-form="member"><input type="text" name="t" placeholder="일행 이름 추가" maxlength="12" class="grow" aria-label="일행 이름"><button class="btn">추가</button></form>
  </div>

  <div class="group-title">지도</div>
  <div class="group">
    <div class="item"><div class="grow"><b>지도 서비스</b><div class="faint" style="font-size:13px">자동: 국내 여행은 카카오맵, 해외 여행은 구글맵</div></div>
      <select data-change="provider" style="width:auto">${[['auto', `자동 (${PNAME[KR.test(r.dest + ' ' + r.name) ? 'kakao' : 'google']})`], ['kakao', '카카오맵'], ['google', '구글맵']].map(([v, n]) => `<option value="${v}" ${(r.mapProvider || 'auto') === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="item"><div class="grow"><b>연결 상태</b><div class="faint" style="font-size:13px">카카오 ${k.kakao ? (failed.kakao ? '키 오류' : '연결됨') : '키 없음'} · 구글 ${k.google ? (failed.google ? '키 오류' : '연결됨') : '키 없음'}${(!k[pv] || failed[pv]) ? ' — 지금은 OpenStreetMap으로 보여드려요' : ''}</div></div><button class="btn sm" data-act="keys">${I('key', 15)}키 설정</button></div>
  </div>

  ${shared(r) ? `<div class="group-title">입장 비밀번호</div>
  <div class="group"><div class="item"><div class="grow"><b>${S.sync[r.id].hasPass ? '비밀번호가 걸려 있어요' : '비밀번호 없음'}</b><div class="faint" style="font-size:13px">${S.sync[r.id].hasPass ? '초대 링크를 받은 사람도 비밀번호를 알아야 들어올 수 있어요.' : '걸어두면 링크를 받은 사람도 비밀번호를 입력해야 들어와요.'}</div></div>
    ${S.sync[r.id].admin ? `<button class="btn sm ${S.sync[r.id].hasPass ? '' : 'pri'}" data-act="set-pass">${I('key', 15)}${S.sync[r.id].hasPass ? '바꾸기' : '설정'}</button>` : '<span class="tag">방장만 바꿀 수 있어요</span>'}</div></div>` : ''}
  <div class="group-title">공유 · 백업</div>
  <div class="group">
    <div class="item"><div class="grow"><b>공유 링크</b><div class="faint" style="font-size:13px">링크에 여행방 전체가 담겨요. 친구가 열면 내용이 자동으로 합쳐져요.</div></div><button class="btn pri sm" data-act="share">${I('link', 15)}만들기</button></div>
    <div class="item"><div class="grow"><b>파일로 내보내기</b><div class="faint" style="font-size:13px">사진까지 모두 담긴 백업 파일(.json)</div></div><button class="btn sm" data-act="export">${I('down2', 15)}내보내기</button></div>
    <div class="item"><div class="grow"><b>가져오기</b><div class="faint" style="font-size:13px">받은 링크나 백업 파일을 합쳐요</div></div><button class="btn sm" data-act="import">${I('upload', 15)}가져오기</button></div>
  </div>

  <div class="group-title" style="color:var(--danger)">위험 구역</div>
  <div class="group"><div class="item"><div class="grow"><b>이 여행방 지우기</b><div class="faint" style="font-size:13px">이 기기에서만 지워져요. 친구들 기기에는 남아 있어요.</div></div><button class="btn sm danger" data-act="del-room">지우기</button></div></div>`;
}
function keysModal() {
  const k = { kakao: S.keys?.kakao || '', google: S.keys?.google || '' };
  openModal({
    title: '지도 키 설정',
    body: `<p class="muted" style="margin:0;font-size:14px">여기에 넣은 키는 <b>이 기기에만</b> 저장돼요. 친구들에게도 적용하려면 저장소의 <code>config.js</code>에 넣어주세요.</p>
      <label class="field"><span>카카오 JavaScript 키 <small>· 국내 여행</small></span><input type="text" name="kakao" value="${esc(k.kakao)}" placeholder="${CFG.kakaoKey ? 'config.js 키 사용 중' : '비어 있음'}" autocomplete="off" spellcheck="false"></label>
      <p class="faint" style="margin:-8px 0 0;font-size:12.5px">developers.kakao.com → 내 애플리케이션 → 플랫폼 Web에 <b>${esc(location.origin)}</b> 등록, 카카오맵 사용 설정 ON</p>
      <label class="field"><span>구글 Maps API 키 <small>· 해외 여행</small></span><input type="text" name="google" value="${esc(k.google)}" placeholder="${CFG.googleKey ? 'config.js 키 사용 중' : '비어 있음'}" autocomplete="off" spellcheck="false"></label>
      <p class="faint" style="margin:-8px 0 0;font-size:12.5px">Maps JavaScript API + Places API (New) 사용 설정, HTTP 리퍼러 제한에 <b>${esc(location.origin)}/*</b></p>`,
    onOk(f) {
      S.keys = { kakao: f.kakao.value.trim(), google: f.google.value.trim() }; save();
      toast('저장했어요. 새로고침하면 적용돼요.');
      setTimeout(() => location.reload(), 900);
    },
  });
}

// ───── 공통 모달들 ─────
function roomModal() {
  const s = isoDate(addDays(isoDate(new Date()), 14));
  const t0 = Math.floor(Math.random() * TONES.length);
  openModal({
    title: '새 여행 만들기',
    body: `<label class="field"><span>어디로 가나요?</span><input type="text" name="dest" required maxlength="30" placeholder="제주, 오사카, 강릉…"></label>
      <label class="field"><span>여행 이름</span><input type="text" name="name" maxlength="40" placeholder="비워두면 '우리의 ○○ 여행'"></label>
      <div class="grid2"><label class="field"><span>출발</span><input type="date" name="start" required value="${s}"></label><label class="field"><span>도착</span><input type="date" name="end" required value="${isoDate(addDays(s, 2))}"></label></div>
      <div class="field"><span>커버 색</span><div class="tones">${TONES.map((t, i) => `<label class="tone ${i === t0 ? 'on' : ''}" style="--tone:${t[0]}"><input type="radio" name="tone" value="${i}" ${i === t0 ? 'checked' : ''} aria-label="색 ${i + 1}"></label>`).join('')}</div></div>
      <label class="field"><span>내 이름</span><input type="text" name="me" required maxlength="12" placeholder="친구들이 부르는 이름"></label>
      <label class="field"><span>함께 가는 사람 <small>· 쉼표로 구분, 나중에 추가해도 돼요</small></span><input type="text" name="others" placeholder="유진, 민수, 지우"></label>`,
    ok: '여행방 만들기',
    onOk(f) {
      const d = Object.fromEntries(new FormData(f));
      if (d.end < d.start) { toast('도착일이 출발일보다 빨라요'); return false; }
      const others = d.others.split(/[,，、\n]/).map((x) => x.trim()).filter(Boolean);
      const dest = d.dest.trim();
      const r = newRoom({ name: d.name.trim() || `우리의 ${dest} 여행`, dest, start: d.start, end: d.end, members: [d.me.trim(), ...others], tone: +d.tone });
      sysMsg(r, `${d.me.trim()}님이 여행방을 만들었어요`);
      S.rooms[r.id] = r; S.me[r.id] = r.members[0].id; save();
      go(`#/r/${r.id}/places`); setTimeout(() => shareModal(r, true), 250);
    },
  });
}
function pickMe(r) {
  if ($('#modal-root').innerHTML) return;
  const form = openModal({
    title: '나는 누구인가요?',
    body: `<p class="muted" style="margin:0">${esc(r.name)}에서 하트와 의견이 이 이름으로 남아요.</p>
      <div class="menu" style="padding:0">${r.members.map((m) => `<button type="button" data-m="${m.id}">${av(m, 30)}<span>${esc(m.name)}</span></button>`).join('')}</div>
      <label class="field"><span>목록에 없다면</span><div class="row"><input type="text" name="n" placeholder="내 이름" maxlength="12" class="grow"><button class="btn pri">참여하기</button></div></label>`,
  });
  $$('[data-m]', form).forEach((b) => b.addEventListener('click', () => { S.me[r.id] = b.dataset.m; save(); closeModal(); render(); }));
  form.addEventListener('submit', () => {
    const n = form.n.value.trim(); if (!n) return;
    const m = { id: uid(), name: n, color: COLORS[r.members.length % COLORS.length], upd: now() };
    r.members.push(m); S.me[r.id] = m.id; sysMsg(r, `${n}님이 들어왔어요`); touch(r, m); closeModal(); render();
  });
}
async function shareModal(r, fresh) {
  if (SYNC && !r.demo && !shared(r)) {
    const f0 = openModal({
      title: fresh ? '여행방이 만들어졌어요' : '일행 초대',
      body: `<p class="muted" style="margin:0;font-size:14px"><b>실시간 공유방</b>으로 열면 친구들이 링크 하나로 들어와서 함께 고치고, 바뀐 내용이 몇 초 안에 모두에게 보여요.</p>
        <ul class="muted" style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.8"><li>링크를 가진 사람만 들어올 수 있어요</li><li>방장은 입장 비밀번호를 걸 수 있어요 (여행방 설정)</li><li>지금부터 올리는 여행 사진도 함께 봐요</li></ul>
        <button type="button" class="btn pri block" data-live style="height:46px">${I('share', 16)}실시간 공유방 열기</button>
        <button type="button" class="btn ghost" data-legacy>서버 없이 링크로만 주고받기</button>`,
    });
    $('[data-live]', f0).addEventListener('click', async (e) => {
      e.currentTarget.disabled = true; e.currentTarget.textContent = '여는 중…';
      try { await makeShared(r); closeModal(); render(); shareModal(r); toast('실시간 공유방을 열었어요'); }
      catch (err) { toast('서버에 연결하지 못했어요. 잠시 후 다시 해주세요.'); closeModal(); }
    });
    $('[data-legacy]', f0).addEventListener('click', () => { closeModal(); shareModal(Object.assign(r, { _legacy: true })); });
    if (!r._legacy) return;
  }
  delete r._legacy;
  if (shared(r)) {
    const url = sharedUrl(r), msg = `[모아여행] ${r.name} 같이 계획해요!\n${url}`;
    const f1 = openModal({
      title: '일행 초대',
      body: `<div class="row">${syncPill(r)}</div>
        <p class="muted" style="margin:0;font-size:14px">이 링크를 단체톡에 보내주세요. 열면 바로 같은 여행방에 들어와요.</p>
        <div class="input-wrap">${I('link', 16)}<input type="text" readonly value="${esc(url)}" style="font-size:13px" aria-label="초대 링크"></div>
        <p class="faint" style="margin:-6px 0 0;font-size:12.5px">링크에 참여 키가 들어 있어요. 일행에게만 보내주세요.</p>
        <div class="row wrap"><button type="button" class="btn pri grow" data-copy>${I('copy', 16)}링크 복사</button>${navigator.share ? `<button type="button" class="btn grow" data-native>${I('share', 16)}공유</button>` : ''}</div>
        <button type="button" class="btn ghost" data-plan>${I('cal', 16)}일정을 텍스트로 복사</button>`,
    });
    $('input[readonly]', f1).addEventListener('focus', (e) => e.target.select());
    $('[data-copy]', f1).addEventListener('click', () => copy(msg, '복사했어요. 단체톡에 붙여넣어 주세요!'));
    $('[data-native]', f1)?.addEventListener('click', () => navigator.share({ title: r.name, text: `[모아여행] ${r.name} 같이 계획해요!`, url }).catch(() => {}));
    $('[data-plan]', f1).addEventListener('click', () => copy(planText(r), '일정을 복사했어요'));
    return;
  }
  const link = await shareLink(r);
  const msg = `[모아여행] ${r.name} 같이 계획해요!\n${link}`;
  const form = openModal({
    title: fresh ? '여행방이 만들어졌어요' : '초대 · 공유',
    body: `<p class="muted" style="margin:0;font-size:14px">링크를 단체톡에 보내세요. 지금까지의 장소·일정·정산이 모두 담겨 있어요. 친구가 내용을 더하면 <b>그 친구의 새 링크</b>를 열어 합치면 돼요.</p>
      <div class="input-wrap">${I('link', 16)}<input type="text" readonly value="${esc(link)}" style="font-size:13px" aria-label="공유 링크"></div>
      ${link.length > 6000 ? '<p class="faint" style="margin:-6px 0 0;font-size:12.5px">링크가 길어 일부 메신저에서 잘릴 수 있어요. 그럴 땐 파일로 내보내기를 써주세요.</p>' : ''}
      <div class="row wrap"><button type="button" class="btn pri grow" data-copy>${I('copy', 16)}링크 복사</button>${navigator.share ? `<button type="button" class="btn grow" data-native>${I('share', 16)}공유</button>` : ''}</div>
      <button type="button" class="btn ghost" data-plan>${I('cal', 16)}일정을 텍스트로 복사</button>`,
  });
  $('input[readonly]', form).addEventListener('focus', (e) => e.target.select());
  $('[data-copy]', form).addEventListener('click', () => copy(msg, '복사했어요. 단체톡에 붙여넣어 주세요!'));
  $('[data-native]', form)?.addEventListener('click', () => navigator.share({ title: r.name, text: `[모아여행] ${r.name} 같이 계획해요!`, url: link }).catch(() => {}));
  $('[data-plan]', form).addEventListener('click', () => copy(planText(r), '일정을 복사했어요'));
}
function importModal() {
  openModal({
    title: '여행방 가져오기',
    body: `<label class="field"><span>친구가 보낸 공유 링크</span><textarea name="link" placeholder="https://…#join=…" style="min-height:80px"></textarea></label>
      <label class="field"><span>또는 백업 파일 <small>(.json)</small></span><input type="file" name="file" accept=".json,application/json" style="height:auto;padding:10px"></label>`,
    ok: '가져오기',
    onOk(f) {
      const file = f.file.files[0], link = f.link.value.trim();
      if (file) {
        file.text().then((t) => {
          try { const inc = JSON.parse(t); if (!inc.id || !inc.members) throw 0; S.rooms[inc.id] = S.rooms[inc.id] ? mergeRoom(S.rooms[inc.id], inc) : inc; save(); toast('가져왔어요'); go(`#/r/${inc.id}/places`); } catch (e) { toast('모아여행 파일이 아니에요'); }
        });
      } else if (link.includes('#join=')) location.hash = 'join=' + link.split('#join=')[1];
      else { toast('링크나 파일을 넣어주세요'); return false; }
    },
  });
}
function moreMenu(r) {
  const tab = route().tab;
  const f = openModal({
    title: '더보기', raw: true,
    body: `<div class="menu">
      ${TABS.filter((t) => !BNAV.includes(t.k)).map((t) => `<button type="button" data-t="${t.k}" style="${tab === t.k ? 'font-weight:700' : ''}">${I(t.i)}${t.n}${counts(r, t.k)}</button>`).join('')}
      <hr>
      <button type="button" data-x="share">${I('share')}초대 · 공유</button>
      <button type="button" data-x="theme">${I('moon')}테마 바꾸기</button>
      <button type="button" data-x="home">${I('home')}내 여행 목록</button>
    </div>`,
  });
  f.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-t],button[data-x]'); if (!b) return;
    closeModal();
    if (b.dataset.t) go(`#/r/${r.id}/${b.dataset.t}`);
    if (b.dataset.x === 'share') shareModal(r);
    if (b.dataset.x === 'theme') cycleTheme();
    if (b.dataset.x === 'home') go('#/');
  });
}
function cycleTheme() {
  S.theme = { auto: 'dark', dark: 'light', light: 'auto' }[S.theme] || 'auto'; save(); applyTheme();
  mapCtl?.destroy(); mapCtl = null; render();
  toast({ auto: '기기 설정을 따라요', dark: '어두운 테마', light: '밝은 테마' }[S.theme]);
}

// ───────── 이벤트 ─────────
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el || el.closest('#modal-root')) return;
  const a = el.dataset.act, r = route().page === 'room' ? room() : null;
  const P = (id) => r.places.find((p) => p.id === id);
  const acts = {
    home: () => go('#/'),
    open: () => go(`#/r/${el.dataset.id}/places`),
    tab: () => go(`#/r/${r.id}/${el.dataset.k}`),
    more: () => moreMenu(r),
    'new-room': roomModal,
    import: importModal,
    theme: cycleTheme,
    share: () => shareModal(r),
    keys: keysModal,
    'set-pass': () => {
      const s = S.sync[r.id];
      openModal({
        title: s.hasPass ? '입장 비밀번호 바꾸기' : '입장 비밀번호 설정',
        body: `<p class="muted" style="margin:0;font-size:14px">일행에게는 초대 링크와 비밀번호를 <b>따로</b> 알려주세요. 이미 들어와 있는 사람도 바뀐 비밀번호를 한 번 입력해야 해요.</p>
          <label class="field"><span>새 비밀번호 <small>· 4자 이상</small></span><input type="password" name="pw" minlength="4" maxlength="40" autocomplete="new-password" ${s.hasPass ? '' : 'required'}></label>
          ${s.hasPass ? '<p class="faint" style="margin:-6px 0 0;font-size:12.5px">비워두고 저장하면 비밀번호를 없애요.</p>' : ''}`,
        ok: '저장',
        onOk(f) {
          const pw = f.pw.value;
          api('POST', r.id, { path: '/password', body: { password: pw } })
            .then((res) => { s.hasPass = res.hasPass; s.pass = pw || undefined; save(); sysMsg(r, `${member(r, meId(r)).name}님이 입장 비밀번호를 ${pw ? '설정' : '해제'}했어요`); touch(r); render(); toast(pw ? '비밀번호를 걸었어요' : '비밀번호를 없앴어요'); })
            .catch((e) => toast(e.message));
        },
      });
    },
    'pick-me': () => pickMe(r),
    'fork-demo': () => { const c = JSON.parse(JSON.stringify(r)); c.id = uid(); delete c.demo; c.name = '우리의 제주 여행'; c.updatedAt = now(); S.rooms[c.id] = c; S.me[c.id] = S.me.demo; save(); go(`#/r/${c.id}/room`); toast('내 여행으로 복사했어요. 이름과 날짜를 바꿔보세요'); },
    'reset-demo': () => { S.rooms.demo = demoRoom(); S.me.demo = S.rooms.demo.members[0].id; save(); mapCtl?.destroy(); mapCtl = null; render(); toast('처음 상태로 돌렸어요'); },
    filter: () => { ui.filter = el.dataset.k; render(); },
    sort: () => { ui.sort = el.dataset.k; render(); },
    view: () => { ui.view = el.dataset.k; render(); },
    'add-place': () => placeModal(r),
    'place-menu': () => placeMenu(r, P(el.dataset.id)),
    locate: () => {
      if (!isWide() && ui.view !== 'map') { ui.view = 'map'; ui.sel = el.dataset.id; render(); setTimeout(() => mapCtl?.focus(el.dataset.id), 400); return; }
      mapCtl?.focus(el.dataset.id); mapCtl?.hl(el.dataset.id, true); setTimeout(() => mapCtl?.hl(el.dataset.id, false), 1500);
    },
    heart: () => { const p = P(el.dataset.id), me = meId(r); p.hearts = p.hearts.includes(me) ? p.hearts.filter((h) => h !== me) : [...p.hearts, me]; touch(r, p); render(); },
    cmt: () => { ui.openCmt[el.dataset.id] = !ui.openCmt[el.dataset.id]; render(); if (ui.openCmt[el.dataset.id]) $(`[data-form=cmt][data-id="${el.dataset.id}"] input`)?.focus({ preventScroll: true }); },
    'del-cmt': () => { const p = P(el.dataset.id); p.comments = p.comments.filter((c) => c.id !== el.dataset.c); touch(r, p); render(); },
    'confirm-plan': async () => {
      if (await confirmBox({ title: '이 일정으로 확정할까요?', msg: '확정하면 날짜·순서가 잠기고, 다녀온 곳을 체크할 수 있어요. 언제든 다시 열 수 있어요.', ok: '확정하기' })) {
        r.confirmed = { at: now(), by: meId(r) }; sysMsg(r, `${member(r, meId(r)).name}님이 일정을 확정했어요`); touch(r); render(); toast('일정을 확정했어요');
      }
    },
    'reopen-plan': () => { delete r.confirmed; sysMsg(r, `${member(r, meId(r)).name}님이 일정을 다시 열었어요`); touch(r); render(); toast('다시 고칠 수 있어요'); },
    visit: () => { const p = P(el.dataset.id); p.visited = !p.visited; touch(r, p); render(); if (p.visited) toast(`'${p.name}' 다녀왔어요`); },
    'set-day': () => { if (locked(r)) return; const p = P(el.dataset.id), d = +el.dataset.d || 0; placeInDay(r, p, d); render(); if (d) toast(`${d}일차에 넣었어요`); },
    move: () => {
      if (locked(r)) return;
      const p = P(el.dataset.id), items = dayItems(r, p.day), i = items.indexOf(p), j = i + +el.dataset.dir;
      if (j < 0 || j >= items.length) return;
      [items[i], items[j]] = [items[j], items[i]];
      if (items[i].time && items[j].time) [items[i].time, items[j].time] = [items[j].time, items[i].time];
      items.forEach((x, k) => { x.order = k; x.upd = now(); }); touch(r); render();
    },
    'copy-plan': () => copy(planText(r), '일정을 복사했어요. 단체톡에 붙여넣어 보세요!'),
    'add-exp': () => expModal(r),
    'add-doc': () => docModal(r),
    'open-doc': () => docView(r, r.docs.find((d) => d.id === el.dataset.id)),
    'edit-exp': () => expModal(r, r.expenses.find((e) => e.id === el.dataset.id)),
    'copy-settle': () => { const { tx } = settle(r); copy(`💸 ${r.name} 정산\n총 ${won(r.expenses.reduce((s, e) => s + e.amount, 0))}\n\n` + tx.map((t) => `${member(r, t.from).name} → ${member(r, t.to).name}  ${won(t.amt)}`).join('\n'), '정산 결과를 복사했어요'); },
    'pack-template': () => { PACK_TEMPLATE.forEach((t) => { if (!r.checklist.some((c) => c.text === t)) r.checklist.push({ id: uid(), text: t, who: null, done: false, upd: now() }); }); touch(r); render(); },
    'pack-toggle': () => { const c = r.checklist.find((x) => x.id === el.dataset.id); c.done = !c.done; touch(r, c); render(); },
    'pack-del': () => { ev.stopPropagation(); const c = r.checklist.find((x) => x.id === el.dataset.id); removeUndo(r, 'checklist', c.id, `'${c.text}'을(를)`); },
    'add-entry': () => entryModal(r),
    'del-entry': () => removeUndo(r, 'journal', el.dataset.id, '기록을'),
    photo: () => openModal({ title: '사진', body: `<img src="${el.src}" style="width:100%;border-radius:12px" alt="여행 사진">` }),
    'rename-mem': () => {
      const m = member(r, el.dataset.id);
      openModal({ title: '이름 변경', body: `<label class="field"><span>새 이름</span><input type="text" name="n" required maxlength="12" value="${esc(m.name)}"></label>`, onOk(f) { m.name = f.n.value.trim(); touch(r, m); render(); } });
    },
    'del-mem': async () => {
      const m = member(r, el.dataset.id);
      if (await confirmBox({ title: `${esc(m.name)}님을 내보낼까요?`, msg: '정산과 준비물 담당에서도 빠져요.', ok: '내보내기', danger: true })) {
        r.members = r.members.filter((x) => x.id !== m.id); r.del = r.del || {}; r.del[m.id] = now();
        if (S.me[r.id] === m.id) delete S.me[r.id]; touch(r); render();
      }
    },
    export: () => { const blob = new Blob([JSON.stringify(r, null, 1)], { type: 'application/json' }); const a2 = document.createElement('a'); a2.href = URL.createObjectURL(blob); a2.download = `모아여행-${r.name}.json`; a2.click(); },
    'del-room': async () => {
      if (await confirmBox({ title: '여행방을 지울까요?', msg: `'${esc(r.name)}'을(를) 이 기기에서 지워요. 공유 링크나 백업 파일이 없으면 되돌릴 수 없어요.`, ok: '지우기', danger: true })) {
        delete S.rooms[r.id]; delete S.me[r.id]; save(); go('#/');
      }
    },
  };
  acts[a]?.();
});
document.addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[role=checkbox][data-act]')) { ev.preventDefault(); ev.target.click(); }
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('[data-form]'); if (!f) return;
  ev.preventDefault();
  const r = room(), t = f.t?.value.trim(), kind = f.dataset.form;
  if (kind === 'gate' && t) {
    const s = S.sync[r.id];
    joinShared(r.id, s.key, t).then(() => { render(); toast('다시 연결했어요'); }).catch((e) => toast(e.message));
    return;
  }
  if (kind === 'chat' && t) { r.messages.push({ id: uid(), by: meId(r), text: t, at: now(), upd: now() }); touch(r); render(); $('.composer input')?.focus(); }
  if (kind === 'cmt' && t) { const p = r.places.find((x) => x.id === f.dataset.id); p.comments.push({ id: uid(), by: meId(r), text: t, at: now() }); touch(r, p); render(); $(`[data-form=cmt][data-id="${p.id}"] input`)?.focus({ preventScroll: true }); }
  if (kind === 'pack' && t) { const c = { id: uid(), text: t, who: f.who.value || null, done: false }; r.checklist.push(c); touch(r, c); render(); $('[data-form=pack] input')?.focus(); }
  if (kind === 'member' && t) { const m = { id: uid(), name: t.slice(0, 12), color: COLORS[r.members.length % COLORS.length] }; r.members.push(m); sysMsg(r, `${t}님이 일행에 추가됐어요`); touch(r, m); render(); }
  if (kind === 'room') {
    const d = Object.fromEntries(new FormData(f));
    if (d.end < d.start) return toast('도착일이 출발일보다 빨라요');
    const pv0 = provider(r);
    Object.assign(r, { name: d.name.trim(), dest: d.dest.trim(), start: d.start, end: d.end, tone: d.tone !== undefined ? +d.tone : r.tone });
    const n = dayCount(r); r.places.forEach((p) => { if (p.day > n) p.day = null; });
    if (provider(r) !== pv0) { mapCtl?.destroy(); mapCtl = null; }
    touch(r); render(); toast('저장했어요');
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.closest('[data-form=room]') && el.name === 'tone') { $$('[data-form=room] .tone').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked)); return; }
  const k = el.dataset.change; if (!k) return;
  const r = room();
  if (/^assign|^time$/.test(k) && locked(r)) { render(); return; }
  if (k === 'assign' && el.value) { placeInDay(r, r.places.find((x) => x.id === el.value), +el.dataset.d); render(); }
  if (k === 'assign-one' && el.value) { placeInDay(r, r.places.find((x) => x.id === el.dataset.id), +el.value); render(); toast(`${el.value}일차에 넣었어요`); }
  if (k === 'time') { const p = r.places.find((x) => x.id === el.dataset.id); p.time = el.value; reorderByTime(r, p.day); touch(r, p); render(); }
  if (k === 'provider') { r.mapProvider = el.value; mapCtl?.destroy(); mapCtl = null; touch(r); render(); toast(`${PNAME[provider(r)]}을(를) 써요`); }
});
// 모아둔 곳 글자 검색 (다시 그리지 않고 바로 거르기)
document.addEventListener('input', (ev) => {
  if (!ev.target.matches('[data-q]')) return;
  ui.q = ev.target.value; const q = ui.q.trim().toLowerCase();
  let shown = 0;
  $$('.plist .place').forEach((c) => { const ok = !q || c.dataset.s.includes(q); c.classList.toggle('hidden', !ok); shown += ok; });
  let none = $('.plist .q-none');
  if (!shown && q) { if (!none) { none = document.createElement('div'); none.className = 'q-none empty'; $('.plist')?.prepend(none); } none.innerHTML = `<h3>'${esc(ui.q)}'와(과) 맞는 곳이 없어요</h3><p>다른 말로 찾아보거나, 새 장소로 제안해 보세요.</p>`; }
  else none?.remove();
});
// 카드 ↔ 지도 핀 강조
document.addEventListener('mouseover', (ev) => { const c = ev.target.closest?.('.place[data-pid]'); if (c && c !== hover.el) { hover.el && mapCtl?.hl(hover.el.dataset.pid, false); hover.el = c; mapCtl?.hl(c.dataset.pid, true); } });
document.addEventListener('mouseout', (ev) => { if (hover.el && !hover.el.contains(ev.relatedTarget)) { mapCtl?.hl(hover.el.dataset.pid, false); hover.el = null; } });
const hover = { el: null };
// 일정 끌어다 놓기
let dragId = null;
document.addEventListener('dragstart', (ev) => { const d = ev.target.closest?.('[data-drag]'); if (!d) return; dragId = d.dataset.drag; d.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', dragId); });
document.addEventListener('dragend', () => { dragId = null; $$('.dragging,.over').forEach((x) => x.classList.remove('dragging', 'over')); });
document.addEventListener('dragover', (ev) => { const z = ev.target.closest?.('[data-drop]'); if (!z || !dragId) return; ev.preventDefault(); $$('.over').forEach((x) => x !== z && x.classList.remove('over')); z.classList.add('over'); });
document.addEventListener('drop', (ev) => {
  const z = ev.target.closest?.('[data-drop]'); if (!z || !dragId) return;
  ev.preventDefault();
  const r = room(), p = r.places.find((x) => x.id === dragId), d = +z.dataset.drop;
  if (locked(r)) return;
  const stops = $$('.stop', z).filter((s) => s.dataset.drag !== dragId);
  let idx = stops.findIndex((s) => { const b = s.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
  if (idx < 0) idx = stops.length;
  placeInDay(r, p, d, idx); dragId = null; render();
});

// ───────── 시작 ─────────
applyTheme();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => { if (S.theme === 'auto') { applyTheme(); render(); } });
if (/^#(join|s)=/.test(location.hash)) checkJoin(); else render();
