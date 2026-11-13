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
  { k: 'today', n: '오늘', i: 'sun' }, { k: 'places', n: '모아둔 곳', i: 'pin' }, { k: 'plan', n: '우리 일정', i: 'cal' },
  { k: 'money', n: '정산', i: 'wallet' }, { k: 'docs', n: '보관함', i: 'ticket' }, { k: 'chat', n: '대화', i: 'chat' },
  { k: 'room', n: '여행방 설정', i: 'sliders' },
  { k: 'journal', n: '여행 기록', i: 'camera', hide: true }, { k: 'pack', n: '준비물', i: 'checks', hide: true },
];
// 숨은 탭이 어느 메뉴에 속하는지
const NAV_OF = { journal: 'docs', pack: 'plan' };
const navOn = (tab, k) => tab === k || NAV_OF[tab] === k;
// '오늘'은 여행 기간이거나 출발 3일 전부터만 보여요
const showToday = (r) => !!r && !undated(r) && !r.demo ? (tripToday(r) > 0 || (new Date(r.start) - new Date(isoDate(new Date()))) / 864e5 <= 3 && new Date(r.end) >= new Date(isoDate(new Date()))) : !!r?.demo;
const navTabs = (r) => TABS.filter((t) => !t.hide && (t.k !== 'today' || showToday(r)));
const bnavKeys = (r) => (r && tripToday(r) ? ['today', 'plan', 'money', 'docs'] : ['places', 'plan', 'money', 'docs']);
const PACK_TEMPLATE = ['신분증 · 여권', '충전기 · 보조배터리', '세면도구', '상비약', '선크림', '갈아입을 옷', '우산', '멀티탭'];
const KR = /한국|대한민국|국내|서울|부산|제주|강릉|속초|양양|경주|전주|여수|순천|대전|대구|인천|광주|울산|수원|춘천|가평|남해|통영|거제|포항|목포|군산|강원|경기|충청|충북|충남|전라|전북|전남|경상|경북|경남|청주|안동|단양|태안|서산|보령|울릉|독도|평창|홍천|용인|파주|seoul|busan|jeju|korea|gangneung/i;

// ───────── 아이콘 ─────────
const ICONS = {
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
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
const ui = { mapOff: (() => { try { return !!localStorage.getItem('moa.mapOff'); } catch (e) { return false; } })(), moneyView: (() => { try { return localStorage.getItem('moa.moneyView') || 'list'; } catch (e) { return 'list'; } })(), planView: (() => { try { return localStorage.getItem('moa.planView') || 'cards'; } catch (e) { return 'cards'; } })(), planDay: 0, planMap: true, filter: 'all', sort: 'new', view: 'map', openCmt: {}, q: '' };
const failed = {};
let mapCtl = null;

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.rooms) return { keys: {}, ...s }; } catch (e) { /* noop */ }
  return { rooms: {}, me: {}, theme: 'auto', keys: {} };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { toast('이 기기의 저장 공간이 꽉 찼어요. 함께 보는 여행방으로 열면 사진은 서버에 저장돼요.'); return false; }
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
// 날짜를 아직 안 정한 여행: start/end 가 비어 있고 days(예상 일수)만 있어요
const undated = (r) => !r.start || !r.end;
const dayLabel = (r, n) => { if (undated(r)) return ''; const d = addDays(r.start, n - 1); return `${d.getMonth() + 1}.${pad(d.getDate())} ${WD[d.getDay()]}`; };
const dl = (r, n) => (undated(r) ? '' : ` · ${dayLabel(r, n)}`);
const dayCount = (r) => (undated(r) ? Math.min(30, Math.max(1, +r.days || 3)) : Math.min(30, Math.max(1, Math.round((new Date(r.end) - new Date(r.start)) / 864e5) + 1 || 1)));
const fmtRange = (a, b) => `${+a.slice(5, 7)}.${a.slice(8)} – ${+b.slice(5, 7)}.${b.slice(8)}`;
const range = (r) => (undated(r) ? '날짜 미정' : fmtRange(r.start, r.end));
const nights = (r) => { const d = dayCount(r); return (d === 1 ? '당일' : `${d - 1}박 ${d}일`) + (undated(r) ? ' 예정' : ''); };
const destName = (r) => r.dest || '어디로?';
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
  if (undated(r)) return '날짜 미정';
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
  const inc = cleanRoom(res.room), merged = local ? mergeRoom(local, inc) : inc;
  if (local) { const had = new Set(local.messages.map((m) => m.id)); const fresh = merged.messages.filter((m) => !had.has(m.id) && !m.sys && m.by !== meId(merged)); if (fresh.length) setTimeout(() => notifyChat(merged, fresh), 0); }
  const changed = !local || JSON.stringify(forSync(merged)) !== JSON.stringify(forSync(local));
  // 같은 객체를 유지해요: 열린 창(서랍·상세 등)이 들고 있는 여행방이 낡은 사본이 되지 않도록
  if (local) { Object.keys(local).forEach((k) => delete local[k]); Object.assign(local, merged); } else S.rooms[id] = merged;
  Object.assign(S.sync[id], { v: res.version, hasPass: !!res.hasPass, needPass: false }); save();
  if (changed && route().id === id) safeRender();
}
function safeRender() {
  const a = document.activeElement;
  if (!$('#modal-root').innerHTML && a?.closest?.('.composer') && route().tab === 'chat') { refreshChat(); return; }
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
  if (!shared(r) || sync.busy[r.id] || S.sync[r.id].needPass) return;
  if (document.hidden) { if (Date.now() - (sync.bg || 0) < 20000) return; sync.bg = Date.now(); }
  try { const res = await api('GET', r.id, { v: S.sync[r.id].v }); if (res) applyRemote(r.id, res); setOnline(true); if (sync.deferred) safeRender(); }
  catch (e) { onSyncError(r.id, e); }
}
setInterval(pollNow, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { pollNow(); if (room()) safeRender(); } });
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
  const inc = cleanRoom(res.room); if (ex) { const m = mergeRoom(ex, inc); Object.keys(ex).forEach((k) => delete ex[k]); Object.assign(ex, m); } else S.rooms[id] = inc; save();
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
const ph = (src, alt = '사진', act = true) => { const a = act ? ' data-act="photo"' : ''; return isRef(src) ? `<span class="ph"><img data-photo="${esc(src)}" alt="${alt}"${a}></span>` : PHOTO_OK.test(src || '') ? `<span class="ph"><img src="${src}" alt="${alt}"${a} class="ready" loading="lazy"></span>` : ''; };
const photoCache = new Map();
async function uploadPhotos(r, list) {
  if (!shared(r)) return list;
  const out = [];
  for (const d of list) {
    let pid = null, err = null;
    for (let i = 0; i < 2 && !pid; i++) { try { ({ pid } = await api('POST', r.id, { path: '/photos', body: { data: d } })); } catch (e) { err = e; } }
    if (pid) out.push('p:' + pid);
    else { out.push(d); setTimeout(() => toast(`사진을 서버에 올리지 못했어요 (${err?.message || '연결 오류'}). 이 기기에서만 보여요.`), 1600); }
  }
  return out;
}
function hydratePhotos() {
  const r = room(); if (!r) return;
  $$('img[data-photo]').forEach(async (img) => {
    const ref = img.dataset.photo;
    if (!photoCache.has(ref)) photoCache.set(ref, api('GET', r.id, { path: `/photos/${ref.slice(2)}` }).then((b) => URL.createObjectURL(b)).catch(() => { setTimeout(() => photoCache.delete(ref), 15000); return ''; }));
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
function pinData(r, day) {
  return r.places.filter((p) => p.lat && (!day || p.day === day)).map((p) => {
    const day = p.day ? r.places.filter((x) => x.day === p.day).sort(sortPlan).indexOf(p) + 1 : 0;
    return { p, color: p.day ? COLORS[(p.day - 1) % COLORS.length] : cat(p.cat).c, label: day ? String(day) : '', dim: !p.day };
  });
}
function lines(r, day) {
  const out = [];
  for (let d = 1; d <= dayCount(r); d++) {
    if (day && d !== day) continue;
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
  const ctl = { el, roomId: r.id, pv: want, kind: null, r, impl: null, fitted: false, day: null, sel: null,
    update(nr) { this.r = nr; this.impl?.draw(nr, false, this.day); if (this.sel) this.impl?.hl(this.sel, true); },
    setDay(d) { d = d || null; if (d === this.day) return; this.day = d; this.impl?.draw(this.r, true, d); if (this.sel) this.impl?.hl(this.sel, true); },
    select(id) { if (this.sel && this.sel !== id) this.impl?.hl(this.sel, false); this.sel = id; if (id) { this.impl?.hl(id, true); this.impl?.focus(id); } },
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
    requestAnimationFrame(() => { if (ctl.dead) return; ctl.impl.draw(ctl.r, true, ctl.day); if (ctl.sel) { ctl.impl.hl(ctl.sel, true); ctl.impl.focus(ctl.sel); } });
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
    draw(r, fit, day) {
      layer.clearLayers(); mk = {};
      const pd = pinData(r, day);
      lines(r, day).forEach((l) => L.polyline(l.pts.map((p) => [p.lat, p.lng]), { color: l.color, weight: 3, opacity: 0.75, dashArray: '2 7', lineCap: 'round' }).addTo(layer));
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
    draw(r, fit, day) {
      objs.forEach((o) => o.setMap(null)); objs = []; mk = {};
      lines(r, day).forEach((l) => objs.push(new K.Polyline({ map: m, path: l.pts.map((p) => new K.LatLng(p.lat, p.lng)), strokeWeight: 3, strokeColor: l.color, strokeOpacity: 0.8, strokeStyle: 'shortdot' })));
      const pd = pinData(r, day), b = new K.LatLngBounds();
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
    draw(r, fit, day) {
      objs.forEach((o) => o.setMap(null)); objs = []; mk = {};
      lines(r, day).forEach((l) => objs.push(new G.Polyline({ map: m, path: l.pts.map((p) => ({ lat: p.lat, lng: p.lng })), strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, strokeColor: l.color, scale: 3 }, offset: '0', repeat: '12px' }] })));
      const pd = pinData(r, day), b = new G.LatLngBounds();
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
function selPlace(id, { scroll, focus = true } = {}) {
  ui.sel = id;
  $$('.place.sel,.stop.sel').forEach((x) => x.classList.remove('sel'));
  const els = $$(`.place[data-pid="${id}"],.stop[data-pid="${id}"]`); els.forEach((x) => x.classList.add('sel'));
  if (focus) mapCtl?.select(id); else if (mapCtl) { if (mapCtl.sel && mapCtl.sel !== id) mapCtl.impl?.hl(mapCtl.sel, false); mapCtl.sel = id; mapCtl.impl?.hl(id, true); }
  const card = els.find((x) => x.offsetParent);
  if (scroll && card) { card.scrollIntoView({ behavior: 'smooth', block: isWide() ? 'center' : 'start' }); card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash'); }
}
function pickOnMap(id) { selPlace(id, { scroll: true, focus: false }); }

// ───────── 라우팅 ─────────
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, id, tab] = h.split('/');
  if (a === 'r' && id) return { page: 'room', id, tab: TABS.some((t) => t.k === tab) ? tab : 'places' };
  return { page: 'home' };
}
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
window.addEventListener('hashchange', () => { closeModal(); checkJoin(); ui.sel = null; if (mapCtl) mapCtl.sel = null; render(); scrollTo(0, 0); });
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
  for (const k of ['members', 'places', 'messages', 'expenses', 'checklist', 'journal', 'docs', 'dateOpts', 'destOpts']) {
    const m = new Map();
    [...(a[k] || []), ...(b[k] || [])].forEach((x) => { const c = m.get(x.id); if (!c || (x.upd || x.at || 0) >= (c.upd || c.at || 0)) m.set(x.id, x); });
    out[k] = [...m.values()].filter((x) => !del[x.id]);
  }
  out.journal.forEach((j) => { if (!j.photos?.length && photos[j.id]) j.photos = photos[j.id]; });
  out.messages.sort((x, y) => x.at - y.at);
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}
// 밖에서 들어온 여행방 데이터 정리: 글 내용 외의 값에서 HTML/CSS를 깰 수 있는 문자를 지워요
const FREE = new Set(['name', 'title', 'text', 'memo', 'note', 'addr', 'dest']);
const PHOTO_OK = /^(p:[a-z0-9]{8,32}|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/;
function cleanVal(v, k) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') return FREE.has(k) ? v.slice(0, 2000) : v.replace(/[<>"'`&;(){}\\=]/g, '').slice(0, 300);
  if (Array.isArray(v)) return k === 'photos' ? v.filter((p) => typeof p === 'string' && PHOTO_OK.test(p)) : v.map((x) => cleanVal(x, k));
  if (v && typeof v === 'object') { const o = {}; for (const [kk, vv] of Object.entries(v)) if (!/^__|^constructor$|^prototype$/.test(kk)) o[cleanVal(kk, 'key')] = cleanVal(vv, kk); return o; }
  return typeof v === 'boolean' || v === null ? v : null;
}
const cleanRoom = (r) => { const o = cleanVal(r, 'room'); ['members', 'places', 'messages', 'expenses', 'checklist', 'journal', 'docs', 'dateOpts', 'destOpts'].forEach((k) => { o[k] = (Array.isArray(o[k]) ? o[k] : []).filter((x) => x && typeof x.id === 'string' && x.id); }); return o; };
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
    const inc = cleanRoom(await decodeRoom(m[1]));
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
function openModal({ title, body, ok = '저장', onOk, danger, raw, onClose, cls = '' }) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay ${cls}"><form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title.replace(/<[^>]+>/g, ''))}">
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
  if (r) { r.docs ||= []; S.seen ||= {}; if (S.seen[r.id] == null) S.seen[r.id] = r.messages.at(-1)?.at || 0; }
  document.title = r ? `${rt.tab !== 'chat' && unread(r) ? `(${unread(r)}) ` : ''}${r.name} · 모아여행` : '모아여행 · 함께 모아 만드는 우리 여행';
  const y = scrollY, ae = document.activeElement, keep = ae?.matches?.('.sheet-add input,.sheet-add select') ? `.sheet-add [name="${ae.name}"]` : ae?.dataset?.cell !== undefined ? `[data-cell][data-id="${ae.dataset.id}"][data-f="${ae.dataset.f}"]` : null;
  const sx = $('.sheet-wrap')?.scrollLeft;
  $('#app').innerHTML = `<div class="shell ${r ? 'is-room' : 'is-home'}">${side(rt, r)}<div class="content">${topbar(r)}<main class="main" id="main">${r ? roomPage(r, rt.tab) : home()}</main></div>${r ? bnav(rt.tab, r) : ''}</div>`;
  document.body.classList.toggle('is-home', !r);
  if (S.mapH) document.documentElement.style.setProperty('--map-h', S.mapH + 'px');
  // 지도 다시 꽂기
  const slot = $('#map-slot');
  if (slot && r) {
    if (mapCtl && !mapCtl.dead && mapCtl.roomId === r.id && mapCtl.pv === provider(r)) { slot.replaceWith(mapCtl.el); mapCtl.update(r); mapCtl.resize(); }
    else { mapCtl?.destroy(); mapCtl = createMap(r); slot.replaceWith(mapCtl.el); }
    mapCtl.setDay(rt.tab === 'plan' ? ui.planDay || ui.mapDay || null : rt.tab === 'today' ? todayDay(r) : null);
    if (mapCtl.kind) $('.map-src')?.replaceChildren(document.createTextNode(PNAME[mapCtl.kind]));
  }
  if (r && rt.tab === 'chat') { const el = $('.msgs'); if (el) el.scrollTop = el.scrollHeight; markSeen(r); }
  if (r) { hydratePhotos(); if (rt.tab === 'plan' || rt.tab === 'today') loadWeather(r); }
  scrollTo(0, y);
  if (sx) { const w = $('.sheet-wrap'); if (w) w.scrollLeft = sx; }
  if (keep) $(keep)?.focus({ preventScroll: true });
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
      <nav class="nav">${navTabs(r).filter((t) => t.k !== 'chat' && t.k !== 'room').map((t) => `<button class="${navOn(rt.tab, t.k) ? 'on' : ''}" data-act="tab" data-k="${t.k}">${I(t.i)}<span>${t.n}</span>${counts(r, t.k)}</button>`).join('')}</nav>
      <nav class="nav nav-sub">${['chat', 'room'].map((k) => { const t = TABS.find((x) => x.k === k); return `<button class="${rt.tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${I(t.i)}<span>${t.n}</span>${counts(r, k)}</button>`; }).join('')}</nav>
    </div>` : ''}
    <div>
      <div class="side-label">내 여행</div>
      <nav class="nav">
        ${rooms.filter((x) => !x.demo || rooms.every((y) => y.demo) || (r && r.id === x.id)).map((x) => `<button class="${r && r.id === x.id ? 'on' : ''}" data-act="open" data-id="${x.id}"><span class="trip-dot" style="background:${tone(x)[0]}"></span><span class="ellip">${esc(x.name)}</span></button>`).join('')}
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
function bnav(tab, r) {
  const BN = bnavKeys(r), inMore = !BN.some((k) => navOn(tab, k));
  return `<nav class="bnav" aria-label="여행 메뉴">${BN.map((k) => { const t = TABS.find((x) => x.k === k); return `<button class="${navOn(tab, k) ? 'on' : ''}" data-act="tab" data-k="${k}">${I(t.i, 22)}<span>${t.n.replace('모아둔 곳', '장소').replace('우리 일정', '일정')}</span></button>`; }).join('')}
    <button class="${inMore ? 'on' : ''}" data-act="more" data-k="chat">${I('grid', 22)}${unread(r) ? '<i class="udot"></i>' : ''}<span>더보기</span></button></nav>`;
}
function counts(r, k) {
  if (k === 'chat') { const u = unread(r); if (u) return `<span class="cnt unread">${u > 99 ? '99+' : u}</span>`; }
  const n = { places: r.places.length, money: r.expenses.length, pack: r.checklist.filter((c) => !c.done).length, journal: r.journal.length, docs: (r.docs || []).length + r.journal.length, chat: r.messages.filter((m) => !m.sys).length }[k];
  return n ? `<span class="cnt">${n}</span>` : '';
}
function empty(icon, title, desc, btn = '') {
  return `<div class="empty"><div class="ill">${I(icon, 26, 1.5)}</div><h3>${title}</h3><p>${desc}</p>${btn}</div>`;
}

// ───────── 홈 ─────────
function home() {
  const rooms = Object.values(S.rooms).sort((a, b) => b.updatedAt - a.updatedAt);
  const today = isoDate(new Date());
  const next = rooms.filter((x) => !x.demo && !undated(x) && x.end >= today).sort((a, b) => a.start.localeCompare(b.start))[0];
  const mine = rooms.filter((x) => !x.demo);
  // 내 여행이 생기면 소개·예시는 빼고 내 여행만 간단히
  if (mine.length) return `
  <div class="sec home-sec"><div><h2>내 여행 <span class="faint num" style="font-family:var(--sans);font-size:16px;font-weight:500">${mine.length}</span></h2></div>
    <div class="acts"><button class="btn sm ghost" data-act="import">${I('upload', 16)}가져오기</button><button class="btn sm pri" data-act="new-room">${I('plus', 16)}새 여행</button></div></div>
  ${next ? `<button class="badge-next home-next" data-act="open" data-id="${next.id}"><div class="dday-big">${dday(next)}</div><div class="grow"><div style="font-weight:700">${esc(next.name)}</div><div class="faint" style="font-size:13px">${esc(destName(next))} · ${range(next)} · ${nights(next)}</div></div><span style="transform:rotate(180deg);color:var(--faint)">${I('back', 18)}</span></button>` : ''}
  <div class="trips">${mine.map(tripCard).join('')}</div>
  <footer class="foot"><span>모아여행</span><button class="link faint" data-act="open" data-id="demo">예시 여행 둘러보기</button></footer>`;
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
    <div class="cover" style="${toneStyle(x)}"><span class="badge">${x.demo ? '예시' : dday(x)}</span><div class="dest">${esc(destName(x))}</div></div>
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
    <div class="cover" style="${toneStyle(r)}"><div class="dest">${esc(destName(r))}</div></div>
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
  ${(tab === 'places' || tab === 'plan') && !(shared(r) && S.sync[r.id].needPass) ? decideCard(r) : ''}
  ${shared(r) && S.sync[r.id].needPass ? passGate(r) : ({ chat: chatTab, places: placesTab, plan: planTab, money: moneyTab, pack: packTab, journal: journalTab, docs: docsTab, today: todayTab, room: settingsTab })[tab](r)}`;
}

// ───── 대화 ─────
const chatSeen = {}, newMsg = new Map();
function markSeen(r) { chatSeen[r.id] = new Set(r.messages.map((m) => m.id)); S.seen = S.seen || {}; const last = r.messages.at(-1)?.at || 0; if ((S.seen[r.id] || 0) < last) { S.seen[r.id] = last; save(); } }
const unread = (r) => r.messages.filter((m) => !m.sys && m.by !== meId(r) && m.at > (S.seen?.[r.id] || 0)).length;
function refreshChat() {
  const r = room(), box = $('.msgs'); if (!r || !box) return;
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  const tmp = document.createElement('div'); tmp.innerHTML = chatTab(r);
  box.innerHTML = $('.msgs', tmp).innerHTML; markSeen(r);
  if (near) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
}
function notifyChat(r, fresh) {
  if (route().id !== r.id) return;
  const m = fresh.at(-1), who = member(r, m.by).name;
  if (document.hidden) {
    const u = unread(r); document.title = `(${u}) ${r.name} · 모아여행`;
    if (window.Notification?.permission === 'granted') try { const n = new Notification(`💬 ${r.name}`, { body: `${who}: ${m.text.slice(0, 80)}`, icon: 'icon.svg', tag: 'moa-' + r.id }); n.onclick = () => { focus(); go(`#/r/${r.id}/chat`); n.close(); }; } catch (e) { /* noop */ }
    return;
  }
  if (route().tab === 'chat') return;
  toast(`💬 ${who}: ${m.text.slice(0, 40)}`, { label: '보기', fn() { go(`#/r/${r.id}/chat`); } });
  $$('[data-k="chat"]').forEach((b) => { b.classList.remove('ping'); void b.offsetWidth; b.classList.add('ping'); });
  if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) { /* noop */ }
}
function chatTab(r) {
  const me = meId(r);
  let html = '', prev = null, prevDay = '';
  r.messages.forEach((m) => {
    const d = new Date(m.at), dk = isoDate(d);
    if (dk !== prevDay) { html += `<div class="daydiv">${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일</div>`; prevDay = dk; prev = null; }
    if (m.sys) { html += `<div class="sysmsg">${esc(m.text)}</div>`; prev = null; return; }
    const first = !prev || prev.by !== m.by || m.at - prev.at > 5 * 6e4;
    const w = member(r, m.by), mine = m.by === me;
    if (chatSeen[r.id] && !chatSeen[r.id].has(m.id) && !newMsg.has(m.id)) newMsg.set(m.id, Date.now());
    const fresh = Date.now() - (newMsg.get(m.id) || 0) < 1500;
    html += `<div class="msg ${mine ? 'me' : ''} ${first ? 'first' : ''} ${fresh ? 'new' : ''}">${mine ? '' : av(w, 30)}<div>${first && !mine ? `<div class="who">${esc(w.name)}</div>` : ''}<div class="bub">${esc(m.text)}</div></div><span class="t">${hm(m.at)}</span></div>`;
    prev = m;
  });
  const canAsk = shared(r) && window.Notification && Notification.permission === 'default';
  return `<div class="sec"><div><h2>대화</h2><p>정할 것, 떠오른 생각을 가볍게 남겨요. ${shared(r) ? '새 메시지가 오면 알려드려요.' : '함께 보는 여행방으로 열면 실시간으로 주고받아요.'}</p></div>${canAsk ? `<div class="acts"><button class="btn sm" data-act="notif">${I('bell', 15)}알림 받기</button></div>` : ''}</div>
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
  const wide = isWide(), showMap = wide || ui.view === 'map', showList = true;
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
      ${wide ? '' : `<div class="seg"><button class="${ui.view === 'map' ? 'on' : ''}" data-act="view" data-k="map" aria-label="지도와 목록">${I('map', 16)}</button><button class="${ui.view === 'list' ? 'on' : ''}" data-act="view" data-k="list" aria-label="목록만">${I('list', 16)}</button></div>`}
    </div>
  </div>
  <div class="places-layout ${wide ? 'split' : showMap ? 'stack' : ''}">
    ${showList ? `<div class="plist">${list.length ? list.map((p) => placeCard(r, p)).join('') : r.places.length ? empty('search', '조건에 맞는 장소가 없어요', '다른 분류를 골라보세요.') : empty('pin', '아직 모아둔 곳이 없어요', `${PNAME[pv]}에서 검색해서 가고 싶은 곳을 제안해보세요.`, `<button class="btn pri" data-act="add-place">${I('plus')}첫 장소 제안하기</button>`)}
      <p class="faint" style="text-align:center;font-size:13px;margin:12px 0 0">하트는 순위를 정하는 참고예요. 최종 일정은 함께 이야기해서 정해요.</p></div>` : ''}
    ${showMap ? `<div class="mapblock">
      <div class="${wide ? 'map-pane' : 'map-mobile'}"><div id="map-slot"></div></div>${wide ? '' : '<div class="map-grip" data-grip role="slider" aria-label="지도 크기 조절 (끌어서 조절)" title="끌어서 지도 크기 조절"><i></i></div>'}
      ${wide ? `<div class="row faint" style="font-size:12px;margin-top:8px;gap:6px">${I('map', 14)}<span class="map-src">${PNAME[pv]}</span><span>· 숫자는 일정 순서, 작은 점은 날짜 미정</span></div>` : ''}
    </div>` : ''}
  </div>`;
}
function placeCard(r, p) {
  const c = cat(p.cat), by = member(r, p.by), me = meId(r), on = p.hearts.includes(me), open = ui.openCmt[p.id];
  const days = dayCount(r);
  return `<article class="place ${ui.sel === p.id ? 'sel' : ''}" data-act="sel-place" data-id="${p.id}" data-pid="${p.id}" data-s="${esc(`${p.name} ${p.addr || ''} ${p.memo || ''} ${by.name}`.toLowerCase())}">
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
function placeModal(r, p, pre = {}) {
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
        r.places.push(np); sysMsg(r, `${member(r, meId(r)).name}님이 '${v.name}'을(를) 모았어요`); touch(r, np); if (pre.day) { placeInDay(r, np, pre.day); toast(`${pre.day}일차에 넣었어요`); }
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
// ───── 날씨 (Open-Meteo, 무료·키 없음) — 여행 날짜가 16일 안으로 들어오면 일차마다 표시 ─────
const WX = (() => { try { return JSON.parse(localStorage.getItem('moa.wx')) || {}; } catch (e) { return {}; } })();
const wxIcon = (c) => (c === 0 ? '☀️' : c <= 2 ? '🌤️' : c === 3 ? '☁️' : c <= 48 ? '🌫️' : c <= 57 ? '🌦️' : c <= 67 ? '🌧️' : c <= 77 ? '❄️' : c <= 82 ? '🌦️' : c <= 86 ? '🌨️' : '⛈️');
const wxName = (c) => (c === 0 ? '맑음' : c <= 2 ? '대체로 맑음' : c === 3 ? '흐림' : c <= 48 ? '안개' : c <= 57 ? '이슬비' : c <= 67 ? '비' : c <= 77 ? '눈' : c <= 82 ? '소나기' : c <= 86 ? '눈보라' : '뇌우');
function wxFor(r, d) {
  if (undated(r)) return null;
  const w = WX[r.id]; if (!w) return null;
  return w.days?.[isoDate(addDays(r.start, d - 1))] || null;
}
function wxChip(r, d) {
  const w = wxFor(r, d); if (!w) return '';
  return `<span class="wx" title="${wxName(w.c)} · 최고 ${Math.round(w.hi)}° / 최저 ${Math.round(w.lo)}°${w.p != null ? ` · 비 올 확률 ${w.p}%` : ''}">${wxIcon(w.c)} ${Math.round(w.hi)}°<span class="faint">/${Math.round(w.lo)}°</span>${w.p >= 40 ? `<span class="wx-p">☔${w.p}%</span>` : ''}</span>`;
}
const wxBusy = {};
async function loadWeather(r) {
  if (!r || r.demo || undated(r) || wxBusy[r.id]) return;
  const today = new Date(isoDate(new Date())), s0 = new Date(r.start), e0 = new Date(r.end);
  const ahead = Math.round((s0 - today) / 864e5);
  if (ahead > 15 || e0 < today) return;
  const w = WX[r.id];
  if (w && Date.now() - w.at < 3 * 3600e3 && w.key === `${r.start}${r.end}${r.dest}`) return;
  wxBusy[r.id] = true;
  try {
    let c = center(r);
    if (!c && r.dest) { try { const hit = (await searchPlaces(r.dest, r))?.items?.[0]; if (hit?.lat) c = [hit.lat, hit.lng]; } catch (e) { /* 다음 방법 */ } }
    if (!c && r.dest) { const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${enc(r.dest)}&count=1`)).json(); const x = g?.results?.[0]; if (x) c = [x.latitude, x.longitude]; }
    if (!c) return;
    const st = isoDate(s0 < today ? today : s0), en = isoDate(new Date(Math.min(e0, addDays(isoDate(today), 15))));
    const js = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c[0].toFixed(3)}&longitude=${c[1].toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${st}&end_date=${en}`)).json();
    const days = {}; (js?.daily?.time || []).forEach((t, i) => (days[t] = { c: js.daily.weather_code[i], hi: js.daily.temperature_2m_max[i], lo: js.daily.temperature_2m_min[i], p: js.daily.precipitation_probability_max?.[i] }));
    WX[r.id] = { at: Date.now(), key: `${r.start}${r.end}${r.dest}`, days };
    try { localStorage.setItem('moa.wx', JSON.stringify(WX)); } catch (e) { /* noop */ }
    if (room()?.id === r.id) safeRender();
  } catch (e) { /* 날씨는 없어도 돼요 */ } finally { wxBusy[r.id] = false; }
}
// ───── 오늘 (현장 모드) ─────
const todayDay = (r) => Math.min(dayCount(r), ui.td?.[r.id] || tripToday(r) || 1);
function todayTab(r) {
  const n = dayCount(r), d = todayDay(r), live = tripToday(r) === d;
  const items = dayItems(r, d), next = items.find((p) => !p.visited), done = items.filter((p) => p.visited).length;
  const spent = daySpent(r, d), docs = (r.docs || []).filter((x) => x.day === d), col = COLORS[(d - 1) % COLORS.length];
  const before = !undated(r) && !tripToday(r) && new Date(r.start) > new Date(isoDate(new Date()));
  const ni = next ? items.indexOf(next) : -1;
  return `<div class="today">
  <div class="today-h">
    <button class="btn ghost icon" data-act="today-day" data-d="${d - 1}" ${d <= 1 ? 'disabled' : ''} aria-label="이전 날">${I('back', 18)}</button>
    <div class="grow" style="text-align:center"><div class="today-day" style="color:${col}">${d}일차${live ? ' <span class="live">오늘</span>' : ''}</div><div class="faint" style="font-size:13px">${undated(r) ? '날짜 미정' : dayLabel(r, d)}${before ? ` · 여행까지 ${dday(r)}` : ''}</div>${wxChip(r, d) ? `<div class="today-wx">${wxChip(r, d)}</div>` : ''}</div>
    <button class="btn ghost icon" data-act="today-day" data-d="${d + 1}" ${d >= n ? 'disabled' : ''} aria-label="다음 날" style="transform:rotate(180deg)">${I('back', 18)}</button>
  </div>
  ${items.length ? `
  <div class="today-progress"><i style="width:${(done / items.length) * 100}%;background:${col}"></i></div>
  <div class="faint" style="font-size:12px;text-align:center;margin:6px 0 14px">${done === items.length ? '오늘 일정을 모두 마쳤어요 🎉' : `${items.length}곳 중 ${done}곳 다녀왔어요`}</div>
  ${next ? `<section class="card now" data-pid="${next.id}">
    <div class="now-k">${ni === 0 && !done ? '첫 번째 장소' : '지금 갈 곳'} · ${ni + 1}/${items.length}</div>
    <h2 class="now-name"><span class="dot" style="--c:${cat(next.cat).c}"></span>${esc(next.name)}</h2>
    <div class="faint now-sub">${next.time ? `<b style="color:var(--text)">${next.time}</b> · ` : ''}${esc(next.addr || '주소 없음')}</div>
    ${next.memo ? `<p class="now-memo">${esc(next.memo)}</p>` : ''}
    <div class="now-acts">
      <a class="btn pri big" href="${esc(navLink(r, next))}" target="_blank" rel="noopener">${I('route', 18)}길찾기</a>
      <button class="btn big" data-act="visit" data-id="${next.id}">${I('check', 18, 2.4)}다녀왔어요</button>
    </div>
    <div class="now-acts sm">
      <button class="btn sm" data-act="add-exp" data-d="${d}" data-pid="${next.id}">${I('wallet', 15)}여기서 쓴 돈</button>
      <button class="btn sm" data-act="sel-place" data-id="${next.id}">${I('pin', 15)}지도</button>
      <a class="btn sm" href="${esc(placeLink(r, next))}" target="_blank" rel="noopener">${I('share', 15)}장소 정보</a>
    </div>
  </section>` : ''}
  <ol class="card today-list">${items.map((p, j) => `<li class="${p.visited ? 'done' : ''} ${p === next ? 'cur' : ''}" data-pid="${p.id}">
    <button class="tl-chk" data-act="visit" data-id="${p.id}" aria-pressed="${!!p.visited}" aria-label="${esc(p.name)} 다녀왔어요" style="--c:${col}">${p.visited ? I('check', 14, 2.8) : j + 1}</button>
    <button class="tl-name" data-act="sel-place" data-id="${p.id}"><b>${esc(p.name)}</b>${p.time ? `<span class="faint">${p.time}</span>` : ''}</button>
    ${placeSpent(r, p.id) ? `<span class="tl-amt">${won(placeSpent(r, p.id))}</span>` : ''}
    <a class="btn ghost icon sm" href="${esc(navLink(r, p))}" target="_blank" rel="noopener" aria-label="${esc(p.name)} 길찾기">${I('route', 16)}</a>
  </li>`).join('')}</ol>`
  : `<div class="card">${empty('cal', `${d}일차 일정이 비어 있어요`, '우리 일정에서 이날 갈 곳을 넣어두면, 여기서 순서대로 안내해요.', `<button class="btn pri" data-act="tab" data-k="plan">${I('cal')}일정 짜러 가기</button>`)}</div>`}
  <div class="mapblock today-map"><div class="map-mobile"><div id="map-slot"></div></div><div class="map-grip" data-grip role="slider" aria-label="지도 크기 조절 (끌어서 조절)" title="끌어서 지도 크기 조절"><i></i></div></div>
  <div class="today-g">
    <button class="card today-tile" data-act="add-exp" data-d="${d}"><span class="k">${I('wallet', 16)}이날 쓴 돈</span><b>${won(spent)}</b><span class="faint">＋ 빠르게 기록</span></button>
    <button class="card today-tile" data-act="tab" data-k="docs"><span class="k">${I('ticket', 16)}이날 쓸 티켓</span><b>${docs.length}장</b><span class="faint">${docs.length ? esc(docs.map((x) => x.title).join(', ')) : '보관함 열기'}</span></button>
  </div>
  ${docs.length ? `<div class="docs today-docs">${docs.map((x) => `<button class="doc" data-act="open-doc" data-id="${x.id}"><div class="doc-thumb">${x.photos?.[0] ? ph(x.photos[0], esc(x.title), false) : `<span class="ill">${I('ticket', 24, 1.4)}</span>`}</div><div class="doc-body"><b>${esc(x.title)}</b></div></button>`).join('')}</div>` : ''}
  </div>`;
}


// ───── 지출 표 ─────
function expSheet(r) {
  const n = dayCount(r), curs = Object.keys(r.fx || {}).filter((k) => curOf(k));
  const nm = (id) => member(r, id).name, all = (e) => e.split.length === r.members.length && r.members.every((m) => e.split.includes(m.id));
  const planned = r.places.filter((p) => p.day).sort((a, b) => a.day - b.day || sortPlan(a, b));
  const inp = (e, f, v, extra = '') => `<input data-cell data-kind="exp" data-id="${e.id}" data-f="${f}" value="${esc(v ?? '')}" ${extra}>`;
  const sel = (e, f, opts) => `<select data-cell data-kind="exp" data-id="${e.id}" data-f="${f}">${opts}</select>`;
  let prev = -1;
  const rows = r.expenses.slice().sort((a, b) => expDay(r, a) - expDay(r, b) || a.at - b.at).map((e) => {
    const d = expDay(r, e), col = d ? COLORS[(d - 1) % COLORS.length] : 'var(--line-2)', ec = e.cur && e.cur !== 'KRW' && curOf(e.cur) ? e.cur : 'KRW';
    const sep = d !== prev ? `<tr class="sh-day"><td colspan="12"><span style="color:${col}">${d ? `${d}일차` : '여행 전 · 공통'}</span>${d && !undated(r) ? `<span class="faint">${dayLabel(r, d)}</span>` : ''}<span class="faint">· ${won(daySpent(r, d))}</span></td></tr>` : '';
    prev = d;
    return `${sep}<tr data-pid="${e.id}" style="--c:${col}">
      <td class="c-day">${sel(e, 'day', `<option value="0">공통</option>${Array.from({ length: n }, (_, i) => `<option value="${i + 1}" ${d === i + 1 ? 'selected' : ''}>${i + 1}일차</option>`).join('')}`)}</td>
      <td class="c-name">${inp(e, 'title', e.title, 'maxlength="60"')}</td>
      <td>${sel(e, 'cur', `<option value="KRW">원</option>${[...new Set([...curs, ...(ec !== 'KRW' ? [ec] : [])])].map((k) => `<option value="${k}" ${ec === k ? 'selected' : ''}>${curOf(k).s}</option>`).join('')}`)}</td>
      <td>${inp(e, 'amt', ec === 'KRW' ? e.amount.toLocaleString('ko-KR') : (+e.orig).toLocaleString('ko-KR', { maximumFractionDigits: 2 }), 'inputmode="decimal" class="num"')}</td>
      <td class="c-ro num">${won(e.amount).replace('원', '')}</td>
      <td>${sel(e, 'cat', ECATS.map((c) => `<option value="${c.k}" ${e.cat === c.k ? 'selected' : ''}>${c.n}</option>`).join(''))}</td>
      <td>${sel(e, 'payer', r.members.map((m) => `<option value="${m.id}" ${e.payer === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join(''))}</td>
      <td>${inp(e, 'split', all(e) ? '전원' : e.split.map(nm).join(', '), 'placeholder="전원 또는 이름, 이름"')}</td>
      <td>${sel(e, 'pid', `<option value="">–</option>${planned.map((p) => `<option value="${p.id}" ${e.pid === p.id ? 'selected' : ''}>${p.day}일 · ${esc(p.name)}</option>`).join('')}`)}</td>
      <td class="c-ro num">${won(e.amount / Math.max(1, e.split.length)).replace('원', '')}</td>
      <td class="c-x"><button class="btn ghost icon sm" data-act="edit-exp" data-id="${e.id}" tabindex="-1" title="영수증·자세히" aria-label="${esc(e.title)} 자세히">${e.photos?.length ? I('clip', 14) : I('more', 14)}</button></td>
      <td class="c-x"><button class="btn ghost icon sm" data-act="sheet-exp-del" data-id="${e.id}" tabindex="-1" aria-label="${esc(e.title)} 삭제">${I('x', 14)}</button></td>
    </tr>`;
  }).join('');
  const total = r.expenses.reduce((a, e) => a + e.amount, 0);
  return `<div class="sheet-wrap card"><table class="sheet" data-cols="exp" style="${sheetStyle(EXP_COLS)}">
    <colgroup>${EXP_COLS.map((c) => `<col data-col="${c.k}" style="width:${colW(c.k)}px">`).join('')}</colgroup>
    <thead><tr>${EXP_COLS.map((c, i) => `<th class="${i === 0 ? 'c-day' : i === 1 ? 'c-name' : c.cls === 'ro' ? 'c-ro' : ''}">${c.n}${c.fix ? '' : `<span class="col-rs" data-rs="${c.k}" title="끌어서 너비 조절 · 두 번 누르면 기본"></span>`}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="sh-total"><td colspan="4" style="text-align:right;padding-right:8px">합계</td><td class="c-ro num"><b>${won(total).replace('원', '')}</b></td><td colspan="7"></td></tr>
      <tr><td colspan="12"><form class="sheet-add" data-form="sheet-exp-add"><input name="t" placeholder="＋ 항목 쓰고 Tab" maxlength="60" autocomplete="off" aria-label="새 지출 항목"><input name="a" class="num" inputmode="decimal" placeholder="금액 쓰고 Enter" style="max-width:150px;border-left:1px solid var(--line)" aria-label="새 지출 금액"><button class="btn sm pri" style="display:none">추가</button></form></td></tr></tfoot>
  </table></div>
  <p class="faint sheet-help">칸을 눌러 바로 고쳐요 · 나눈 사람은 "전원" 또는 "민수, 유진"처럼 · 📎 버튼으로 영수증을 붙여요</p>`;
}
function expEdit(el) {
  const r = room(); if (!r) return;
  const e = r.expenses.find((x) => x.id === el.dataset.id); if (!e) return;
  const f = el.dataset.f, v = el.value.trim(), num = +v.replace(/[^\d.]/g, '');
  if (f === 'day') e.day = +v || 0;
  else if (f === 'title') { if (!v) { el.value = e.title; return toast('항목은 비울 수 없어요'); } e.title = v; }
  else if (f === 'cur' || f === 'amt') {
    const cur = f === 'cur' ? v : (e.cur && e.cur !== 'KRW' ? e.cur : 'KRW');
    const shown = f === 'amt' ? num : (e.cur && e.cur !== 'KRW' ? +e.orig : e.amount);
    if (cur !== 'KRW' && !r.fx?.[cur]) { toast('먼저 환율을 정해주세요'); return render(); }
    if (!shown) { toast('금액을 적어주세요'); return render(); }
    Object.assign(e, cur === 'KRW' ? { cur: 'KRW', orig: 0, rate: 0, amount: Math.round(shown) } : { cur, orig: shown, rate: r.fx[cur], amount: Math.round(shown * r.fx[cur]) });
  }
  else if (f === 'split') {
    const names = v.split(/[,，、/ ]+/).map((x) => x.trim()).filter(Boolean);
    if (!names.length || names.includes('전원') || names.includes('모두')) e.split = r.members.map((m) => m.id);
    else { const ids = names.map((x) => r.members.find((m) => m.name === x)?.id).filter(Boolean); const miss = names.filter((x) => !r.members.some((m) => m.name === x)); if (!ids.length) { toast('일행 이름으로 적어주세요'); return render(); } e.split = [...new Set(ids)]; if (miss.length) toast(`일행에 없는 이름은 뺐어요: ${miss.join(', ')}`); }
  }
  else if (f === 'pid') { e.pid = v; const p = r.places.find((x) => x.id === v); if (p?.day && !e.day) e.day = p.day; }
  else e[f] = v;
  touch(r, e); render();
}

// ───── 일정 표 (스프레드시트처럼 바로 고치기) ─────
function planSheet(r) {
  const n = dayCount(r), lock = !!r.confirmed, me = meId(r);
  const rows = r.places.slice().sort((a, b) => (a.day || 99) - (b.day || 99) || sortPlan(a, b));
  const dayOpts = (v, none = '미정') => `<option value="0">${none}</option>` + Array.from({ length: n }, (_, i) => `<option value="${i + 1}" ${v === i + 1 ? 'selected' : ''}>${i + 1}일차</option>`).join('');
  const cell = (p, f, html) => `<td class="c-${f}">${html}</td>`;
  const inp = (p, f, v, extra = '') => `<input data-cell data-id="${p.id}" data-f="${f}" value="${esc(v ?? '')}" ${extra} aria-label="${esc(p.name)} ${f}">`;
  let prevDay = -1;
  const body = rows.map((p) => {
    const d = p.day || 0, idx = d ? dayItems(r, d).indexOf(p) + 1 : '', col = d ? COLORS[(d - 1) % COLORS.length] : 'var(--line-2)';
    const sep = d !== prevDay ? `<tr class="sh-day"><td colspan="12"><span style="color:${col}">${d ? `${d}일차` : '날짜 미정'}</span>${d && !undated(r) ? `<span class="faint">${dayLabel(r, d)}</span>` : ''}${d && daySpent(r, d) ? `<span class="faint">· ${won(daySpent(r, d))}</span>` : ''}</td></tr>` : '';
    prevDay = d;
    const sp = placeSpent(r, p.id);
    return `${sep}<tr data-pid="${p.id}" class="${p.visited ? 'done' : ''} ${ui.sel === p.id ? 'sel' : ''}" style="--c:${col}">
      ${cell(p, 'day', `<select data-cell data-id="${p.id}" data-f="day" ${lock ? 'disabled' : ''} aria-label="일차">${dayOpts(p.day || 0)}</select>`)}
      ${cell(p, 'order', d ? inp(p, 'order', idx, `inputmode="numeric" ${lock ? 'disabled' : ''}`) : '<span class="faint">–</span>')}
      ${cell(p, 'time', inp(p, 'time', p.time, 'placeholder="00:00" inputmode="numeric" maxlength="5"'))}
      ${cell(p, 'name', inp(p, 'name', p.name, 'maxlength="60"'))}
      ${cell(p, 'cat', `<select data-cell data-id="${p.id}" data-f="cat" aria-label="분류">${CATS.map((c) => `<option value="${c.k}" ${p.cat === c.k ? 'selected' : ''}>${c.n}</option>`).join('')}</select>`)}
      ${cell(p, 'addr', inp(p, 'addr', p.addr, 'maxlength="120"'))}
      ${cell(p, 'memo', inp(p, 'memo', p.memo, 'maxlength="300"'))}
      <td class="c-ro num">${p.hearts.length || ''}</td>
      ${curCell(r, p)}${spentCell(r, p)}
      <td class="c-chk"><input type="checkbox" data-cell data-id="${p.id}" data-f="visited" ${p.visited ? 'checked' : ''} aria-label="다녀옴"></td>
      <td class="c-x"><button class="btn ghost icon sm" data-act="sheet-del" data-id="${p.id}" aria-label="${esc(p.name)} 삭제" tabindex="-1">${I('x', 14)}</button></td>
    </tr>`;
  }).join('');
  return `<div class="sec"><div><h2>우리 일정</h2><p>엑셀처럼 칸을 눌러 바로 고쳐요. 고친 내용은 일행 화면에도 바로 반영돼요.</p></div>
    <div class="acts">${planViewSeg()}<button class="btn ghost" data-act="xl-out" title="엑셀로 받기">${I('down2', 16)}엑셀</button></div></div>
  ${lock ? `<div class="locked">${I('check', 18, 2.2)}<span><b>일정 확정</b> · 날짜와 순서는 잠겨 있어요</span><span class="sp"></span><button class="btn sm" data-act="reopen-plan">다시 열기</button></div>` : ''}
  <div class="sheet-wrap card"><table class="sheet" style="${sheetStyle()}">
    <colgroup>${SHEET_COLS.map((c) => `<col data-col="${c.k}" style="width:${colW(c.k)}px">`).join('')}</colgroup>
    <thead><tr>${SHEET_COLS.map((c) => `<th class="c-${c.cls || c.k}">${c.n}${c.fix ? '' : `<span class="col-rs" data-rs="${c.k}" title="끌어서 너비 조절 · 두 번 누르면 기본"></span>`}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><td colspan="12"><form class="sheet-add" data-form="sheet-add"><select name="d" aria-label="새 장소 일차">${dayOpts(ui.sheetDay || 0)}</select><input name="t" placeholder="＋ 장소 이름을 쓰고 Enter (위치는 자동으로 찾아요)" maxlength="60" autocomplete="off" aria-label="새 장소 이름"></form></td></tr></tfoot>
  </table></div>
  <p class="faint sheet-help">Enter: 아래 칸 · ↑↓: 위아래 줄 · Tab: 옆 칸 · 제목 칸 경계를 끌면 너비가 바뀌어요</p>
  <div class="plan-pack" id="pack">${packTab(r)}</div>`;
}
// 표 칸 너비: 기본값은 분류·하트는 좁게, 메모·주소는 넓게. 끌어서 바꾸면 기기에 저장돼요
const SHEET_COLS = [
  { k: 'day', n: '일차', w: 88 }, { k: 'order', n: '순서', w: 48 }, { k: 'time', n: '시간', w: 66 }, { k: 'name', n: '장소', w: 170 },
  { k: 'cat', n: '분류', w: 60 }, { k: 'addr', n: '주소', w: 210 }, { k: 'memo', n: '메모', w: 360 },
  { k: 'heart', n: '♥', w: 40, cls: 'ro' }, { k: 'cur', n: '통화', w: 62 }, { k: 'spent', n: '지출', w: 96 }, { k: 'chk', n: '✓', w: 38, fix: true }, { k: 'x', n: '', w: 36, fix: true },
];
const EXP_COLS = [
  { k: 'e_day', n: '일차', w: 88 }, { k: 'e_title', n: '항목', w: 170 }, { k: 'e_cur', n: '통화', w: 64 }, { k: 'e_amt', n: '금액', w: 100 },
  { k: 'e_krw', n: '원화', w: 96, cls: 'ro' }, { k: 'e_cat', n: '분류', w: 60 }, { k: 'e_payer', n: '낸 사람', w: 84 }, { k: 'e_split', n: '나눈 사람', w: 170 },
  { k: 'e_pid', n: '장소', w: 140 }, { k: 'e_per', n: '1인', w: 84, cls: 'ro' }, { k: 'e_rc', n: '📎', w: 40, fix: true }, { k: 'e_x', n: '', w: 36, fix: true },
];
const colW = (k) => S.colW?.[k] || [...SHEET_COLS, ...EXP_COLS].find((c) => c.k === k).w;
const sheetStyle = (cols = SHEET_COLS) => `width:${cols.reduce((a, c) => a + colW(c.k), 0)}px;--c0:${colW(cols[0].k)}px`;
(() => {
  let st = null;
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest?.('[data-rs]'); if (!h) return;
    e.preventDefault(); h.setPointerCapture(e.pointerId);
    st = { k: h.dataset.rs, x: e.clientX, w: colW(h.dataset.rs), h, table: h.closest('table') }; h.classList.add('on');
  });
  document.addEventListener('pointermove', (e) => {
    if (!st) return;
    const w = Math.round(Math.max(36, Math.min(800, st.w + e.clientX - st.x)));
    S.colW = { ...(S.colW || {}), [st.k]: w };
    $(`col[data-col="${st.k}"]`, st.table).style.width = w + 'px';
    st.table.setAttribute('style', sheetStyle(st.table.dataset.cols === 'exp' ? EXP_COLS : SHEET_COLS));
  });
  const end = () => { if (!st) return; st.h.classList.remove('on'); save(); st = null; };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  document.addEventListener('dblclick', (e) => { const h = e.target.closest?.('[data-rs]'); if (!h) return; if (S.colW) delete S.colW[h.dataset.rs]; save(); render(); });
})();
const moneyViewSeg = () => `<div class="seg"><button class="${ui.moneyView !== 'table' ? 'on' : ''}" data-act="money-view" data-k="list" aria-label="목록으로 보기" title="목록으로 보기">${I('grid', 16)}</button><button class="${ui.moneyView === 'table' ? 'on' : ''}" data-act="money-view" data-k="table" aria-label="표로 보기" title="표로 보기">${I('list', 16)}표</button></div>`;
// 일정 표의 '지출' 칸: 비어 있으면 새 지출, 1건이면 그 금액 수정, 여러 건이면 목록 열기
const P2E = { food: 'food', cafe: 'food', stay: 'stay', shop: 'shop', spot: 'play', etc: 'etc' };
const defCur = (r) => { const ks = Object.keys(r.fx || {}).filter((k) => curOf(k)); return ks.includes(guessCur(r)) ? guessCur(r) : ks[0] || 'KRW'; };
function spentCell(r, p) {
  const lx = r.expenses.filter((e) => e.pid === p.id);
  if (lx.length > 1) return `<td class="c-spent"><button class="sh-multi num" data-act="place-exps" data-id="${p.id}" title="지출 ${lx.length}건">${won(placeSpent(r, p.id)).replace('원', '')}<small>${lx.length}건</small></button></td>`;
  const e = lx[0], fc = e && e.cur && e.cur !== 'KRW' && curOf(e.cur) ? e.cur : null, dc = placeCur(r, p);
  const val = !e ? '' : fc ? fmtCur(fc, e.orig) : e.amount.toLocaleString('ko-KR');
  return `<td class="c-spent" title="${e ? `${esc(e.title)} · ${won(e.amount)}` : '여기서 쓴 돈을 적으면 정산에 들어가요'}"><input data-cell data-id="${p.id}" data-f="spent" class="num" inputmode="decimal" value="${esc(val)}" placeholder="${dc === 'KRW' ? '+ 원' : `+ ${curOf(dc).s}`}" aria-label="${esc(p.name)} 지출"></td>`;
}
// 통화 칸: 지출이 있으면 그 지출의 통화, 없으면 이 장소에서 쓸 통화(p.cur)를 바꿔요
const placeCur = (r, p) => { const e = r.expenses.find((x) => x.pid === p.id); return e ? (e.cur && e.cur !== 'KRW' && curOf(e.cur) ? e.cur : 'KRW') : p.cur && (p.cur === 'KRW' || curOf(p.cur)) ? p.cur : defCur(r); };
function curCell(r, p) {
  const lx = r.expenses.filter((e) => e.pid === p.id);
  if (lx.length > 1) return `<td class="c-cur"><span class="faint" style="padding:0 8px">–</span></td>`;
  const cur = placeCur(r, p), ks = [...new Set(['KRW', ...Object.keys(r.fx || {}).filter((k) => curOf(k)), guessCur(r), cur].filter(Boolean))];
  return `<td class="c-cur"><select data-cell data-id="${p.id}" data-f="cur" aria-label="${esc(p.name)} 통화">${ks.map((k) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${k === 'KRW' ? '원' : curOf(k).s}${k !== 'KRW' && !r.fx?.[k] ? ' (환율 없음)' : ''}</option>`).join('')}<option value="+">다른 통화…</option></select></td>`;
}
function placeCurEdit(r, p, v) {
  if (v === '+') { render(); return fxModal(r, ''); }
  if (v !== 'KRW' && !r.fx?.[v]) { render(); toast(`${curOf(v).n} 환율을 먼저 정해주세요`); return fxModal(r, v); }
  const e = r.expenses.find((x) => x.pid === p.id);
  if (e) {
    const shown = e.cur && e.cur !== 'KRW' ? +e.orig : e.amount;
    Object.assign(e, v === 'KRW' ? { cur: 'KRW', orig: 0, rate: 0, amount: Math.round(shown) } : { cur: v, orig: shown, rate: r.fx[v], amount: Math.round(shown * r.fx[v]) });
    touch(r, e); toast(`${v === 'KRW' ? `${won(shown)}` : `${fmtCur(v, shown)} = ${won(e.amount)}`}로 바꿨어요`);
  } else { p.cur = v; touch(r, p); }
  render();
}
function placeSpentEdit(r, p, v) {
  const n = +String(v).replace(/[^\d.]/g, ''), e = r.expenses.find((x) => x.pid === p.id);
  if (!n) { if (e) removeUndo(r, 'expenses', e.id, `'${e.title}' 지출을`); else render(); return; }
  const cur = e ? (e.cur && e.cur !== 'KRW' && curOf(e.cur) ? e.cur : 'KRW') : placeCur(r, p);
  if (cur !== 'KRW' && !r.fx?.[cur]) { toast('먼저 정산 탭에서 환율을 정해주세요'); return render(); }
  const money = cur === 'KRW' ? { cur: 'KRW', orig: 0, rate: 0, amount: Math.round(n) } : { cur, orig: n, rate: r.fx[cur], amount: Math.round(n * r.fx[cur]) };
  if (e) { Object.assign(e, money); touch(r, e); }
  else { const me = meId(r), ne = { id: uid(), title: p.name, cat: P2E[p.cat] || 'etc', payer: me, split: r.members.map((m) => m.id), day: p.day || 0, pid: p.id, photos: [], at: now(), ...money }; r.expenses.push(ne); touch(r, ne); toast(`'${p.name}' 지출 ${won(ne.amount)} · 낸 사람 나, 전원이 나눠요`, { label: '자세히', fn() { expModal(r, ne); } }); }
  render();
}
function placeExps(r, p) {
  const lx = r.expenses.filter((e) => e.pid === p.id);
  const f = openModal({ title: `${esc(p.name)} 지출`, body: `<div class="card rows" style="margin:0">${lx.map((e) => `<button type="button" class="r" data-e="${e.id}"><div class="grow"><b>${esc(e.title)}</b><div class="faint" style="font-size:12px">${esc(member(r, e.payer).name)} 결제${e.cur && e.cur !== 'KRW' && curOf(e.cur) ? ` · ${fmtCur(e.cur, e.orig)}` : ''}</div></div><span class="amt">${won(e.amount)}</span></button>`).join('')}</div>
    <button type="button" class="btn sm" data-new style="align-self:flex-start">${I('plus', 14)}지출 추가</button>` });
  f.addEventListener('click', (ev) => { const b = ev.target.closest('[data-e],[data-new]'); if (!b) return; closeModal(); b.dataset.e ? expModal(r, r.expenses.find((x) => x.id === b.dataset.e)) : expModal(r, null, { day: p.day || 0, pid: p.id }); });
}
const planViewSeg = () => `<div class="seg"><button class="${ui.planView !== 'table' ? 'on' : ''}" data-act="plan-view" data-k="cards" aria-label="카드로 보기" title="카드로 보기">${I('grid', 16)}</button><button class="${ui.planView === 'table' ? 'on' : ''}" data-act="plan-view" data-k="table" aria-label="표로 보기" title="표로 보기">${I('list', 16)}표</button></div>`;
function sheetEdit(el) {
  const r = room(); if (!r) return;
  const p = r.places.find((x) => x.id === el.dataset.id); if (!p) return;
  const f = el.dataset.f, v = el.type === 'checkbox' ? el.checked : el.value.trim();
  const refocus = () => { render(); $(`[data-cell][data-id="${p.id}"][data-f="${f}"]`)?.focus(); };
  if (f === 'day') { placeInDay(r, p, +v || 0); return refocus(); }
  if (f === 'order') { const k = Math.max(1, Math.round(+v || 1)); placeInDay(r, p, p.day, k - 1); return refocus(); }
  if (f === 'time') { const m = v.replace(/[^\d]/g, ''); const t = v ? (m.length <= 2 ? `${m.padStart(2, '0')}:00` : `${m.slice(0, -2).padStart(2, '0')}:${m.slice(-2)}`) : ''; if (t && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) { el.value = p.time || ''; return toast('시간은 13:30처럼 적어주세요'); } p.time = t; el.value = t; }
  else if (f === 'name') { if (!v) { el.value = p.name; return toast('장소 이름은 비울 수 없어요'); } p.name = v; }
  else if (f === 'visited') { p.visited = v; el.closest('tr')?.classList.toggle('done', v); }
  else if (f === 'spent') return placeSpentEdit(r, p, v);
  else if (f === 'cur') return placeCurEdit(r, p, v);
  else p[f] = v;
  touch(r, p);
}
document.addEventListener('change', (ev) => { if (ev.target.matches?.('[data-cell]')) (ev.target.dataset.kind === 'exp' ? expEdit : sheetEdit)(ev.target); });
document.addEventListener('keydown', (ev) => {
  const el = ev.target; if (!el.matches?.('input[data-cell]:not([type=checkbox])')) return;
  const dir = ev.key === 'Enter' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowUp' ? -1 : 0;
  if (!dir) { if (ev.key === 'Escape') { el.blur(); } return; }
  ev.preventDefault();
  if (el.value !== el.defaultValue) { el.defaultValue = el.value; (el.dataset.kind === 'exp' ? expEdit : sheetEdit)(el); }
  const td = el.closest('td'), tr = td?.closest('tr'); if (!tr) return;
  const ci = [...tr.children].indexOf(td);
  let t = dir > 0 ? tr.nextElementSibling : tr.previousElementSibling;
  while (t && !t.dataset.pid) t = dir > 0 ? t.nextElementSibling : t.previousElementSibling;
  el.blur();
  const go2 = () => { const target = t ? t.children[ci]?.querySelector('input,select') : (dir > 0 ? $('.sheet-add input') : null); target?.focus(); target?.select?.(); };
  // 값이 바뀌어 화면이 다시 그려졌으면 같은 칸 기준으로 다시 찾기
  setTimeout(() => { if (!document.contains(tr)) { const f = el.dataset.f; const rows = $$('.sheet tbody tr[data-pid]'); const i = rows.findIndex((x) => x.dataset.pid === el.dataset.id); const nx = rows[i + dir]; (nx ? nx.querySelector(`[data-f="${f}"]`) : $('.sheet-add input'))?.focus(); } else go2(); }, 0);
});
async function sheetAdd(r, f) {
  const name = f.t.value.trim(), d = +f.d.value || 0; if (!name) return;
  ui.sheetDay = d;
  const me = meId(r), p = { id: uid(), name: name.slice(0, 60), cat: 'etc', addr: '', memo: '', by: me, hearts: [me], comments: [], day: null, order: 0, time: '', at: now(), upd: now() };
  r.places.push(p); placeInDay(r, p, d); sysMsg(r, `${member(r, me).name}님이 '${p.name}'을(를) 모았어요`);
  render(); $('.sheet-add input')?.focus();
  try {
    const res = await searchPlaces(`${r.dest || ''} ${name}`.trim(), r), hit = res?.items?.[0];
    if (hit?.lat) { Object.assign(p, { lat: hit.lat, lng: hit.lng, addr: hit.addr || '', cat: hit.cat || p.cat, kid: hit.kid, gid: hit.gid }); touch(r, p); safeRender(); }
  } catch (e) { /* 위치 없이 둬요 */ }
}

function planTab(r) {
  if (ui.planView === 'table') return planSheet(r);
  const days = dayCount(r), pending = dayItems(r, 0);
  const lock = !!r.confirmed, planned = r.places.filter((p) => p.day), visited = planned.filter((p) => p.visited).length;
  const cur = ui.planDay > days ? 0 : ui.planDay, showMap = !ui.mapOff;
  const dayList = cur ? [cur] : Array.from({ length: days }, (_, i) => i + 1);
  return `<div class="sec"><div><h2>우리 일정</h2><p>${lock ? '확정된 일정이에요. 다녀온 곳은 체크해 보세요.' : '날짜마다 갈 곳을 넣고, 순서와 시간을 맞춰요.'}</p></div>
    <div class="acts">${planViewSeg()}<button class="btn ghost" data-act="xl-out" title="엑셀로 받기">${I('down2', 16)}엑셀</button><button class="btn" data-act="copy-plan">${I('copy', 16)}단체톡용 복사</button>${lock ? '' : `<button class="btn pri" data-act="confirm-plan" ${planned.length ? '' : 'disabled style="opacity:.5"'}>${I('check', 16, 2.2)}일정 확정</button>`}</div></div>
  ${lock ? `<div class="locked">${I('check', 18, 2.2)}<span><b>일정 확정</b> · ${esc(member(r, r.confirmed.by).name)}님이 ${timeAgo(r.confirmed.at)} 확정했어요</span><span class="faint">다녀온 곳 ${visited}/${planned.length}</span><span class="sp"></span><button class="btn sm" data-act="reopen-plan">다시 열기</button></div>` : ''}
  <div class="plan-bar">
    <div class="chips daychips-c">
      <button class="chip ${!cur ? 'on' : ''}" data-act="plan-day" data-d="0">전체</button>
      ${Array.from({ length: days }, (_, i) => `<button class="chip ${cur === i + 1 ? 'on' : ''}" data-act="plan-day" data-d="${i + 1}"><span class="dot" style="--c:${COLORS[i % COLORS.length]}"></span>${i + 1}일차</button>`).join('')}
    </div>
    <button class="btn sm pend-btn ${pending.length ? 'has' : ''}" data-act="pending" title="날짜 미정 장소">${I('pin', 15)}미정 <b>${pending.length}</b></button>
    <button class="btn sm ${showMap ? '' : 'pri'}" data-act="map-toggle" aria-pressed="${showMap}" title="${showMap ? '지도 숨기기' : '지도 보이기'}" aria-label="${showMap ? '지도 끄기' : '지도 켜기'}">${I('map', 15)}<span class="pb-t">${showMap ? '지도 끄기' : '지도 켜기'}</span></button>
  </div>
  <div class="places-layout ${showMap ? (isWide() ? 'split' : 'stack') : ''} plan-layout"><div class="plan-main">
  <div class="days ${cur ? 'single' : ''}">
  ${dayList.map((d) => {
    const items = dayItems(r, d), col = COLORS[(d - 1) % COLORS.length];
    const md = !cur && ui.mapDay === d;
    return `<section class="day ${cur === d || md ? 'on' : ''} ${!cur && ui.mapDay && !md ? 'dim' : ''}" data-drop="${d}" id="day-${d}" ${cur ? '' : `data-act="map-day" data-d="${d}" title="눌러서 지도에 ${d}일차만 표시"`}>
      <div class="day-head"><span class="day-pick"><span class="day-no" style="color:${col}">${d}일차</span><span class="day-date">${dayLabel(r, d)}</span>${wxChip(r, d)}${md ? `<span class="tag accent" style="font-size:11px">${I('map', 11)} 지도에 표시 중</span>` : ''}</span><span class="sp"></span>
        <button class="day-spent ${daySpent(r, d) ? '' : 'zero'}" data-act="add-exp" data-d="${d}" title="${d}일차 지출 추가">${I('wallet', 14)}${daySpent(r, d) ? won(daySpent(r, d)) : '지출'}<span class="plus">＋</span></button>
        ${items.length > 1 ? `<a class="btn ghost sm" href="${esc(routeUrl(r, items))}" target="_blank" rel="noopener" title="${PNAME[provider(r)]} 경로">${I('route', 16)}경로</a>` : ''}</div>
      ${items.length ? `<ol class="stops">${items.map((p, j) => `<li class="stop ${p.visited ? 'visited' : ''} ${ui.sel === p.id ? 'sel' : ''}" data-pid="${p.id}" ${lock ? '' : `draggable="true" data-drag="${p.id}"`} style="--c:${col}">
        <span class="stop-no">${j + 1}</span>
        <div class="grow"><button type="button" class="stop-name" data-act="place-detail" data-id="${p.id}"><span class="dot" style="--c:${cat(p.cat).c}"></span>${esc(p.name)}${p.lat ? '' : '<span class="faint" style="font-size:11px;font-weight:500">위치 없음</span>'}</button>
          <div class="stop-sub"><input type="time" value="${p.time || ''}" data-change="time" data-id="${p.id}" aria-label="${esc(p.name)} 시간" ${lock ? 'disabled' : ''}>${p.hearts.length ? `<span class="faint" style="font-size:12px">♥ ${p.hearts.length}</span>` : ''}${p.memo ? `<span class="faint stop-memo">${esc(p.memo)}</span>` : ''}<button class="stop-exp ${placeSpent(r, p.id) ? 'has' : ''}" data-act="add-exp" data-d="${d}" data-pid="${p.id}" title="${esc(p.name)}에서 쓴 돈 기록">${placeSpent(r, p.id) ? won(placeSpent(r, p.id)) : '＋ 지출'}</button></div></div>
        ${lock ? `<button class="visit ${p.visited ? 'on' : ''}" data-act="visit" data-id="${p.id}" aria-pressed="${!!p.visited}" aria-label="${esc(p.name)} 다녀왔어요" title="다녀왔어요">${I('check', 15, 2.6)}</button>`
          : `<div class="stop-ctrl"><button data-act="visit" data-id="${p.id}" aria-label="다녀왔어요 표시" title="다녀왔어요">${I('check', 16)}</button><button data-act="move" data-id="${p.id}" data-dir="-1" aria-label="위로">${I('up', 16)}</button><button data-act="move" data-id="${p.id}" data-dir="1" aria-label="아래로">${I('down', 16)}</button><button data-act="set-day" data-id="${p.id}" data-d="0" aria-label="일정에서 빼기" title="미정으로 빼기">${I('x', 16)}</button></div>`}
      </li>`).join('')}</ol>` : `<div class="day-empty">${lock ? '이 날은 비어 있어요' : '아직 갈 곳이 없어요'}</div>`}
      ${lock ? '' : `<button class="day-add-btn" data-act="pending" data-d="${d}">${I('plus', 15)}${d}일차에 장소 넣기</button>`}
    </section>`;
  }).join('')}
  </div>
  </div>${showMap ? planMap(r) : ''}</div>
  <div class="plan-pack" id="pack">${packTab(r)}</div>`;
}
// 날짜 미정 장소 서랍 (PC는 오른쪽, 모바일은 아래에서 올라와요)
function pendingDrawer(r0, day) {
  // 서랍은 한 번만 열고, 날짜 선택·검색·넣기는 목록만 다시 그려요 (입력 칸·애니메이션 유지)
  const R = () => room() || r0;
  const n = dayCount(R()), lock = !!R().confirmed;
  ui.drawDay = Math.min(n, day || ui.drawDay || ui.planDay || 1);
  const f = openModal({
    title: `날짜 미정 장소 <span class="faint pend-count" style="font-weight:500"></span>`, cls: 'drawer', raw: true,
    body: `<div class="modal-b drawer-b">
      ${lock ? '<p class="faint" style="margin:0">일정이 확정돼 있어요. 날짜를 넣으려면 먼저 "다시 열기"를 눌러주세요.</p>' : `<div class="field"><span>어느 날에 넣을까요?</span><div class="chips pend-days" style="flex-wrap:wrap">${Array.from({ length: n }, (_, i) => `<button type="button" class="chip" data-dd="${i + 1}"><span class="dot" style="--c:${COLORS[i % COLORS.length]}"></span>${i + 1}일차</button>`).join('')}</div></div>`}
      <div class="input-wrap">${I('search', 16)}<input type="search" data-dq value="${esc(ui.drawQ || '')}" placeholder="미정 장소에서 찾기" aria-label="미정 장소 찾기" autocomplete="off"></div>
      <div class="pend-list"></div>
    </div>
    <div class="modal-f"><button type="button" class="btn" data-new style="flex:1">${I('search', 15)}새 장소 찾아서 추가</button></div>`,
  });
  const qi = $('[data-dq]', f);
  const draw = () => {
    const r = R(), q = (qi.value || '').trim().toLowerCase(), all = dayItems(r, 0);
    const list = all.sort((x, y) => y.hearts.length - x.hearts.length || y.at - x.at).filter((p) => !q || `${p.name} ${p.addr || ''} ${p.memo || ''}`.toLowerCase().includes(q));
    $('.pend-count', f).textContent = all.length;
    $$('[data-dd]', f).forEach((b) => b.classList.toggle('on', +b.dataset.dd === ui.drawDay));
    $('.pend-list', f).innerHTML = list.length ? list.map((p) => `<div class="pend-item"><button type="button" class="grow pend-name" data-pd="${p.id}"><span class="dot" style="--c:${cat(p.cat).c}"></span><b>${esc(p.name)}</b>${p.hearts.length ? `<span class="faint">♥${p.hearts.length}</span>` : ''}${p.addr ? `<span class="faint ellip1 pend-addr">${esc(p.addr)}</span>` : ''}</button>${lock ? '' : `<button type="button" class="btn sm pri" data-pa="${p.id}">${ui.drawDay}일차에 넣기</button>`}</div>`).join('')
      : `<p class="faint" style="text-align:center;margin:18px 0">${q ? '찾는 장소가 없어요' : '날짜 미정 장소가 없어요. 모두 일정에 들어갔어요 🎉'}</p>`;
  };
  draw();
  f.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-dd],[data-pa],[data-pd],[data-new]'); if (!t) return;
    const r = R();
    if (t.dataset.dd) { ui.drawDay = +t.dataset.dd; return draw(); }
    if (t.dataset.pa) {
      const p = r.places.find((x) => x.id === t.dataset.pa); if (!p) return draw();
      placeInDay(r, p, ui.drawDay); toast(`'${p.name}'을(를) ${ui.drawDay}일차에 넣었어요`);
      sync.deferred = true; // 서랍을 닫으면 뒤 화면을 새로 그려요
      return draw();
    }
    if (t.dataset.pd) { closeModal(); return placeDetail(r, r.places.find((x) => x.id === t.dataset.pd)); }
    if (t.dataset.new !== undefined) { closeModal(); placeModal(r, null, { day: lock ? 0 : ui.drawDay }); }
  });
  qi.addEventListener('input', () => { ui.drawQ = qi.value; draw(); });
}
// 장소 상세 (일정·표·서랍에서 눌렀을 때)
function placeDetail(r, p) {
  if (!p) return;
  if (p.lat) selPlace(p.id, { focus: true });
  const me = meId(r), on = p.hearts.includes(me), c = cat(p.cat), lx = r.expenses.filter((e) => e.pid === p.id), n = dayCount(r), lock = !!r.confirmed;
  const f = openModal({
    title: `<span class="dot" style="--c:${c.c};width:10px;height:10px"></span> ${esc(p.name)}`,
    body: `<div class="row wrap" style="gap:6px"><span class="tag">${c.n}</span>${p.day ? `<span class="tag accent">${p.day}일차${dl(r, p.day)}${p.time ? ` · ${p.time}` : ''}</span>` : '<span class="tag">날짜 미정</span>'}${p.visited ? '<span class="tag">다녀옴</span>' : ''}<span class="faint" style="font-size:12px">${esc(member(r, p.by).name)}님 제안</span></div>
      ${p.addr ? `<div class="pd-row">${I('pin', 16)}<span class="grow">${esc(p.addr)}</span></div>` : ''}
      ${p.memo ? `<p class="pd-memo">${esc(p.memo)}</p>` : ''}
      <div class="pd-acts">
        <a class="btn pri" href="${esc(navLink(r, p))}" target="_blank" rel="noopener">${I('route', 16)}길찾기</a>
        <a class="btn" href="${esc(placeLink(r, p))}" target="_blank" rel="noopener">${I('share', 16)}장소 정보</a>
        <button type="button" class="btn ${on ? 'on-heart' : ''}" data-x="heart">${I('heart', 16, 2)}${p.hearts.length || ''}</button>
      </div>
      ${lock ? '' : `<div class="field"><span>날짜</span><div class="chips" style="flex-wrap:wrap"><button type="button" class="chip ${!p.day ? 'on' : ''}" data-day="0">미정</button>${Array.from({ length: n }, (_, i) => `<button type="button" class="chip ${p.day === i + 1 ? 'on' : ''}" data-day="${i + 1}">${i + 1}일차</button>`).join('')}</div></div>`}
      <div class="field"><span>여기서 쓴 돈 ${lx.length ? `<b>${won(placeSpent(r, p.id))}</b>` : ''}</span>
        ${lx.map((e) => `<button type="button" class="pd-exp" data-e="${e.id}"><span class="grow">${esc(e.title)} <span class="faint">· ${esc(member(r, e.payer).name)}</span></span><span class="amt">${e.cur && e.cur !== 'KRW' && curOf(e.cur) ? `${fmtCur(e.cur, e.orig)} · ` : ''}${won(e.amount)}</span></button>`).join('')}
        <button type="button" class="btn sm" data-x="exp" style="align-self:flex-start">${I('plus', 14)}지출 기록</button></div>
      ${p.comments?.length ? `<div class="field"><span>의견 ${p.comments.length}</span>${p.comments.slice(-3).map((m) => `<div class="pd-cmt"><b>${esc(member(r, m.by).name)}</b> ${esc(m.text)}</div>`).join('')}</div>` : ''}
      <div class="row" style="gap:6px"><button type="button" class="btn sm ghost" data-x="edit">${I('edit', 15)}수정</button>${p.lat ? `<button type="button" class="btn sm ghost" data-x="map">${I('map', 15)}지도에서 보기</button>` : ''}<span class="sp"></span><button type="button" class="btn sm ghost danger" data-x="del">${I('trash', 15)}삭제</button></div>`,
  });
  f.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-x],[data-day],[data-e]'); if (!t) return;
    r = room() || r; p = r.places.find((x) => x.id === p.id) || p; // 동기화로 바뀐 최신 데이터 사용
    const x = t.dataset.x;
    if (t.dataset.day !== undefined) { placeInDay(r, p, +t.dataset.day); render(); return placeDetail(r, p); }
    if (t.dataset.e) { closeModal(); return expModal(r, r.expenses.find((e) => e.id === t.dataset.e)); }
    if (x === 'heart') { const i = p.hearts.indexOf(me); if (i >= 0) p.hearts.splice(i, 1); else p.hearts.push(me); touch(r, p); render(); return placeDetail(r, p); }
    closeModal();
    if (x === 'exp') expModal(r, null, { day: p.day || 0, pid: p.id });
    if (x === 'edit') placeModal(r, p);
    if (x === 'map') { if (ui.mapOff) { ui.mapOff = false; saveMapOff(); render(); } selPlace(p.id, { scroll: true }); }
    if (x === 'del') removeUndo(r, 'places', p.id, `'${p.name}'을(를)`);
  });
}
const saveMapOff = () => { try { localStorage.setItem('moa.mapOff', ui.mapOff ? '1' : ''); } catch (e) { /* noop */ } };
function planMap(r) {
  return `<div class="mapblock plan-map">${ui.mapDay && !ui.planDay ? `<button class="map-day-pill" data-act="map-day" data-d="${ui.mapDay}">${ui.mapDay}일차만 표시 중 · 전체 보기 ${I('x', 13)}</button>` : ''}${isWide() ? '<div class="map-pane"><div id="map-slot"></div></div>' : '<div class="map-mobile"><div id="map-slot"></div></div><div class="map-grip" data-grip role="slider" aria-label="지도 크기 조절 (끌어서 조절)" title="끌어서 지도 크기 조절 · 두 번 누르면 기본"><i></i></div>'}</div>`;
}
function planText(r) {
  let t = `✈️ ${r.name}\n📍 ${r.dest} · ${range(r)} (${nights(r)})\n`;
  for (let d = 1; d <= dayCount(r); d++) {
    const items = dayItems(r, d);
    t += `\n[${d}일차${dl(r, d)}]\n` + (items.map((p, i) => `${i + 1}. ${p.time ? p.time + ' ' : ''}${p.name}`).join('\n') || '- 아직 미정');
  }
  const pend = dayItems(r, 0);
  if (pend.length) t += `\n\n💭 후보: ${pend.map((p) => p.name).join(', ')}`;
  return t + '\n\n— 모아여행에서 함께 만든 일정';
}

// ───── 정산 ─────
// 지출의 날짜: 직접 고른 날 > 연결한 장소의 날 > 0(여행 전·공통)
function expDay(r, e) { const d = +e.day || +(e.pid && r.places.find((p) => p.id === e.pid)?.day) || 0; return d >= 1 && d <= dayCount(r) ? d : 0; }
const daySpent = (r, d) => r.expenses.filter((e) => expDay(r, e) === d).reduce((s, e) => s + e.amount, 0);
const placeSpent = (r, pid) => r.expenses.filter((e) => e.pid === pid).reduce((s, e) => s + e.amount, 0);
function tripToday(r) { if (undated(r)) return 0; const d = Math.round((new Date(isoDate(new Date())) - new Date(r.start)) / 864e5) + 1; return d >= 1 && d <= dayCount(r) ? d : 0; }
function expRow(r, e) {
  const pl = e.pid && r.places.find((p) => p.id === e.pid);
  return `<button class="r" data-act="edit-exp" data-id="${e.id}"><span class="dot" style="--c:${ecat(e.cat).c}"></span><div class="grow"><b>${esc(e.title)}</b>${e.photos?.length ? ` <span class="faint" title="영수증 ${e.photos.length}장" style="display:inline-flex;vertical-align:-3px">${I('clip', 15)}</span>` : ''}<div class="faint" style="font-size:12px">${ecat(e.cat).n}${pl ? ` · ${I('pin', 11)} ${esc(pl.name)}` : ''} · ${esc(member(r, e.payer).name)} 결제 · ${e.split.length}명</div></div><div style="text-align:right"><div class="amt">${won(e.amount)}</div><div class="faint num" style="font-size:12px">${e.cur && e.cur !== 'KRW' && curOf(e.cur) ? `${fmtCur(e.cur, e.orig)} · ` : ''}1인 ${won(e.amount / Math.max(1, e.split.length))}</div></div></button>`;
}
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
    <div class="acts"><button class="btn ghost" data-act="xl-out" title="엑셀로 받기">${I('down2', 16)}엑셀</button><button class="btn pri" data-act="add-exp">${I('plus')}지출 추가</button></div></div>
  <div class="card">
    <div class="stats"><div><div class="k">총 지출</div><div class="v">${won(total)}</div></div><div><div class="k">1인 평균</div><div class="v">${won(total / Math.max(1, r.members.length))}</div></div><div><div class="k">내 몫</div><div class="v">${won(mine)}</div></div></div>
    <div style="padding:0 20px 18px"><div class="bar">${byCat.map(([c, v]) => `<i title="${c.n} ${won(v)}" style="width:${(v / total) * 100}%;background:${c.c}"></i>`).join('')}</div>
    <div class="legend">${byCat.map(([c, v]) => `<span class="row" style="gap:6px"><span class="dot" style="--c:${c.c}"></span>${c.n} <b>${won(v)}</b></span>`).join('')}</div></div>
    ${dayBars(r)}
  </div>
  ${fxBar(r)}
  ${ui.moneyView === 'table' ? `<div class="sec"><div><h2>지출 내역</h2><p>${r.expenses.length}건 · 엑셀처럼 칸을 눌러 바로 고쳐요</p></div><div class="acts">${moneyViewSeg()}</div></div>${expSheet(r)}` : ''}
  <div class="two ${ui.moneyView === 'table' ? 'one' : ''}">
    <div>
      <div class="sec"><div><h2>이렇게 보내면 끝</h2><p>송금 횟수가 가장 적게 계산했어요.</p></div>${tx.length ? `<div class="acts"><button class="btn sm" data-act="copy-settle">${I('copy', 15)}복사</button></div>` : ''}</div>
      <div class="card rows">${tx.length ? tx.map((t) => `<div class="r">${av(member(r, t.from), 28)}<b>${esc(member(r, t.from).name)}</b><span class="arrow">→</span>${av(member(r, t.to), 28)}<b class="grow">${esc(member(r, t.to).name)}</b><span class="amt">${won(t.amt)}</span></div>`).join('') : '<div class="r muted">모두 정산 완료! 보낼 돈이 없어요.</div>'}</div>
      <div class="sec"><div><h2>사람별</h2></div></div>
      <div class="card rows">${r.members.map((m) => { const paid = r.expenses.filter((e) => e.payer === m.id).reduce((s, e) => s + e.amount, 0); const b = bal[m.id] || 0;
        return `<div class="r">${av(m, 28)}<div class="grow"><b>${esc(m.name)}</b><div class="faint" style="font-size:12px">낸 돈 ${won(paid)} · 내 몫 ${won(paid - b)}</div></div><span class="amt ${b > 0.5 ? 'pos' : b < -0.5 ? 'neg' : 'faint'}">${b > 0.5 ? '받을 돈 ' : b < -0.5 ? '보낼 돈 ' : ''}${won(Math.abs(b))}</span></div>`; }).join('')}</div>
    </div>
    <div ${ui.moneyView === 'table' ? 'hidden' : ''}>
      <div class="sec"><div><h2>지출 내역</h2><p>${r.expenses.length}건 · 날짜별로 모았어요 · 눌러서 수정</p></div><div class="acts">${moneyViewSeg()}</div></div>
      ${Array.from({ length: dayCount(r) + 1 }, (_, d) => { const list = r.expenses.filter((e) => expDay(r, e) === d).sort((a, b) => b.at - a.at); if (!list.length) return '';
        return `<div class="exp-day" id="exp-d${d}"><div class="exp-day-h"><b>${d ? `${d}일차` : '여행 전 · 공통'}</b>${d ? `<span class="faint">${dayLabel(r, d)}</span>` : ''}<span class="sp"></span><span class="amt">${won(list.reduce((s, e) => s + e.amount, 0))}</span></div>
        <div class="card rows">${list.map((e) => expRow(r, e)).join('')}</div></div>`; }).join('')}
    </div>
  </div>`;
}
function dayBars(r) {
  const n = dayCount(r), vals = Array.from({ length: n + 1 }, (_, d) => daySpent(r, d));
  if (!vals.slice(1).some(Boolean)) return '';
  const max = Math.max(...vals.slice(1), 1);
  return `<div class="daybars"><div class="faint" style="font-size:12px;margin-bottom:10px">하루 지출${vals[0] ? ` · 여행 전·공통 ${won(vals[0])} 별도` : ''}</div><div class="daybars-g" style="--n:${n}">${vals.slice(1).map((v, i) => `<button class="db" data-act="jump-day" data-d="${i + 1}" title="${i + 1}일차 ${won(v)}"><span class="db-v">${v ? won(v).replace('원', '') : ''}</span><i style="height:${Math.max(v ? 6 : 2, (v / max) * 100)}%;background:${COLORS[i % COLORS.length]}"></i><span class="db-l">${i + 1}일차</span></button>`).join('')}</div></div>`;
}
// ───── 환율 ─────
// 여행방마다 r.fx = { JPY: 9.2, USD: 1385 } (1단위당 원). 지출은 원화(amount)로 저장하고 현지 금액(orig)·통화(cur)·환율(rate)을 함께 남겨요
const CURS = [
  { k: 'JPY', s: '¥', n: '엔', u: 100 }, { k: 'USD', s: '$', n: '달러' }, { k: 'EUR', s: '€', n: '유로' }, { k: 'CNY', s: '元', n: '위안' },
  { k: 'TWD', s: 'NT$', n: '대만 달러' }, { k: 'HKD', s: 'HK$', n: '홍콩 달러' }, { k: 'THB', s: '฿', n: '바트' }, { k: 'VND', s: '₫', n: '동', u: 100 },
  { k: 'SGD', s: 'S$', n: '싱가포르 달러' }, { k: 'PHP', s: '₱', n: '페소' }, { k: 'GBP', s: '£', n: '파운드' }, { k: 'AUD', s: 'A$', n: '호주 달러' }, { k: 'CAD', s: 'C$', n: '캐나다 달러' },
];
const curOf = (k) => CURS.find((c) => c.k === k);
const GUESS = [[/일본|도쿄|오사카|교토|후쿠오카|삿포로|오키나와|나고야|japan|tokyo|osaka/i, 'JPY'], [/미국|뉴욕|하와이|괌|사이판|LA|라스베이거스|샌프란|usa/i, 'USD'], [/대만|타이베이|가오슝/i, 'TWD'], [/홍콩|마카오/i, 'HKD'], [/태국|방콕|치앙마이|푸켓/i, 'THB'], [/베트남|다낭|하노이|호치민|나트랑|푸꾸옥/i, 'VND'], [/중국|상하이|베이징|칭다오/i, 'CNY'], [/싱가포르/i, 'SGD'], [/필리핀|세부|보라카이|마닐라/i, 'PHP'], [/영국|런던/i, 'GBP'], [/호주|시드니|멜버른/i, 'AUD'], [/캐나다|밴쿠버|토론토/i, 'CAD'], [/프랑스|파리|이탈리아|로마|스페인|독일|유럽|포르투갈|네덜란드|오스트리아|체코/i, 'EUR']];
const guessCur = (r) => (GUESS.find(([re]) => re.test(`${r.dest} ${r.name}`)) || [])[1];
const fxLabel = (k, rate) => { const c = curOf(k), u = c.u || 1; return `${c.s}${u} = ${won(rate * u)}`; };
const fmtCur = (k, v) => { const c = curOf(k); return `${c.s}${(+v).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`; };
async function liveRate(k) {
  const js = await (await fetch('https://open.er-api.com/v6/latest/KRW')).json();
  const x = js?.rates?.[k]; if (!x) throw new Error('환율을 불러오지 못했어요');
  return Math.round((1 / x) * 10000) / 10000;
}
function fxBar(r) {
  const ks = Object.keys(r.fx || {}).filter((k) => curOf(k)), g = guessCur(r);
  if (!ks.length && !g) return `<div class="fxbar"><button class="chip" data-act="fx" data-k="">${I('plus', 14)}외화 환율 추가</button></div>`;
  return `<div class="fxbar"><span class="faint">환율</span>${ks.map((k) => `<button class="chip" data-act="fx" data-k="${k}">${fxLabel(k, r.fx[k])}</button>`).join('')}
    ${!ks.length && g ? `<button class="chip on" data-act="fx" data-k="${g}">${I('plus', 14)}${curOf(g).n} 환율 설정</button>` : `<button class="chip" data-act="fx" data-k="">${I('plus', 14)}</button>`}</div>`;
}
function fxModal(r, k) {
  k = k || guessCur(r) || 'JPY';
  const c0 = curOf(k), cur = r.fx?.[k], used = (code) => r.expenses.filter((e) => e.cur === code).length;
  const f = openModal({
    title: '환율',
    body: `<label class="field"><span>통화</span><select name="cur">${CURS.map((c) => `<option value="${c.k}" ${c.k === k ? 'selected' : ''}>${c.n} (${c.k} ${c.s})</option>`).join('')}</select></label>
      <label class="field"><span class="fx-unit">${c0.s}${c0.u || 1}당 원화</span><input class="num" type="text" name="rate" inputmode="decimal" required value="${cur ? +(cur * (c0.u || 1)).toFixed(2) : ''}" placeholder="예: 920"></label>
      <button type="button" class="btn sm" data-live style="align-self:flex-start">${I('refresh', 15)}지금 환율 불러오기</button>
      <p class="faint" style="margin:0;font-size:13px">카드사·환전 환율과 조금 다를 수 있어요. 실제 환전한 환율을 적어두면 정산이 더 정확해요.</p>
      <label class="row recalc" style="gap:8px;font-size:14px;${used(k) ? '' : 'display:none'}"><input type="checkbox" name="recalc" checked><span>이 통화로 적은 지출 <b class="n">${used(k)}</b>건도 새 환율로 다시 계산</span></label>
      ${cur ? '<button type="button" class="btn sm ghost danger" data-del style="align-self:flex-start">이 통화 빼기</button>' : ''}`,
    ok: '저장',
    onOk(f) {
      const code = f.cur.value, c = curOf(code), rate = +String(f.rate.value).replace(/[^\d.]/g, '') / (c.u || 1);
      if (!rate) { toast('환율을 적어주세요'); return false; }
      r.fx = { ...(r.fx || {}), [code]: Math.round(rate * 10000) / 10000 };
      let n = 0;
      if (f.recalc.checked) r.expenses.forEach((e) => { if (e.cur === code && e.orig) { e.rate = r.fx[code]; e.amount = Math.round(e.orig * e.rate); e.upd = now(); n++; } });
      touch(r); render(); toast(`${fxLabel(code, r.fx[code])}${n ? ` · 지출 ${n}건 다시 계산` : ''}`);
    },
  });
  const sync = () => { const c = curOf(f.cur.value); $('.fx-unit', f).textContent = `${c.s}${c.u || 1}당 원화`; const v = r.fx?.[c.k]; f.rate.value = v ? +(v * (c.u || 1)).toFixed(2) : ''; const u = used(c.k); $('.recalc', f).style.display = u ? '' : 'none'; $('.recalc .n', f).textContent = u; };
  f.cur.addEventListener('change', sync);
  $('[data-live]', f).addEventListener('click', async (ev) => {
    const b = ev.currentTarget; b.disabled = true;
    try { const c = curOf(f.cur.value), x = await liveRate(c.k); f.rate.value = +(x * (c.u || 1)).toFixed(2); toast(`오늘 환율: ${fxLabel(c.k, x)}`); } catch (e) { toast(e.message); }
    b.disabled = false;
  });
  $('[data-del]', f)?.addEventListener('click', () => { const fx = { ...(r.fx || {}) }; delete fx[f.cur.value]; r.fx = fx; closeModal(); touch(r); render(); });
}
function expModal(r, e, pre = {}) {
  const isNew = !e;
  const curs = Object.keys(r.fx || {}).filter((k) => curOf(k));
  e = e || { title: '', amount: '', cat: 'food', payer: meId(r), split: r.members.map((m) => m.id), day: pre.day ?? tripToday(r), pid: pre.pid || '', cur: tripToday(r) && curs[0] ? curs[0] : 'KRW' };
  const ec = e.cur && e.cur !== 'KRW' ? e.cur : 'KRW', shown = ec === 'KRW' ? e.amount : e.orig;
  const curDay = e.day ?? expDay(r, e), planned = r.places.filter((p) => p.day).sort((a, b) => a.day - b.day || (a.order || 0) - (b.order || 0));
  const form = openModal({
    title: isNew ? '지출 기록' : '지출 수정',
    body: `<label class="field"><span>금액</span><div class="row amt-row"><input class="amount-input num grow" type="text" name="amount" required inputmode="decimal" autocomplete="off" value="${shown ? Number(shown).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : ''}" placeholder="0원">${curs.length || ec !== 'KRW' ? `<select name="cur" class="cur-sel" aria-label="통화"><option value="KRW">원</option>${[...new Set([...curs, ...(ec !== 'KRW' ? [ec] : [])])].map((k) => `<option value="${k}" ${ec === k ? 'selected' : ''}>${curOf(k).s} ${curOf(k).n}</option>`).join('')}</select>` : `<button type="button" class="btn sm ghost" data-fx style="flex:none">외화?</button>`}</div></label>
      <div class="faint per" style="font-size:13px;margin-top:-8px"></div>
      <label class="field"><span>무엇에 썼나요</span><input type="text" name="title" required maxlength="60" value="${esc(e.title)}" placeholder="예: 흑돼지 저녁"></label>
      <div class="field"><span>분류</span><div class="chips" style="flex-wrap:wrap">${ECATS.map((c) => `<label class="chip ${e.cat === c.k ? 'on' : ''}"><input type="radio" name="cat" value="${c.k}" ${e.cat === c.k ? 'checked' : ''}><span class="dot" style="--c:${c.c}"></span>${c.n}</label>`).join('')}</div></div>
      <div class="grid2"><label class="field"><span>언제</span><select name="day"><option value="0">여행 전 · 공통</option>${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}" ${curDay === i + 1 ? 'selected' : ''}>${i + 1}일차${dl(r, i + 1)}</option>`).join('')}</select></label>
        <label class="field"><span>어디서 <small>· 선택</small></span><select name="pid"><option value="">장소 없음</option>${planned.map((p) => `<option value="${p.id}" data-d="${p.day}" ${e.pid === p.id ? 'selected' : ''}>${p.day}일차 · ${esc(p.name)}</option>`).join('')}</select></label></div>
      <div class="field"><span>누가 냈나요</span><div class="chips" style="flex-wrap:wrap">${r.members.map((m) => `<label class="chip ${e.payer === m.id ? 'on' : ''}"><input type="radio" name="payer" value="${m.id}" ${e.payer === m.id ? 'checked' : ''}>${esc(m.name)}</label>`).join('')}</div></div>
      <div class="field"><span>누구와 나누나요</span><div class="chips" style="flex-wrap:wrap">${r.members.map((m) => `<label class="chip ${e.split.includes(m.id) ? 'on' : ''}"><input type="checkbox" name="split" value="${m.id}" ${e.split.includes(m.id) ? 'checked' : ''}>${esc(m.name)}</label>`).join('')}</div></div>
      <div class="field"><span>영수증 사진 <small>· 선택</small></span>
        ${e.photos?.length ? `<div class="photos" style="margin:0">${e.photos.map((x) => ph(x, '영수증')).join('')}</div>` : ''}
        <input type="file" name="files" accept="image/*" multiple style="height:auto;padding:10px"></div>
      ${isNew ? '' : `<button type="button" class="btn sm ghost danger" data-del style="align-self:flex-start">${I('trash', 15)}이 지출 삭제</button>`}`,
    ok: isNew ? '기록하기' : '저장',
    onOk(f) {
      const fd = new FormData(f), split = fd.getAll('split');
      const cur = fd.get('cur') || 'KRW', raw = +String(fd.get('amount')).replace(/[^\d.]/g, '');
      if (cur !== 'KRW' && !r.fx?.[cur]) { toast('먼저 환율을 정해주세요'); fxModal(r, cur); return false; }
      const amount = cur === 'KRW' ? Math.round(raw) : Math.round(raw * r.fx[cur]);
      if (!amount) { toast('금액을 적어주세요'); return false; }
      if (!split.length) { toast('나눌 사람을 한 명 이상 골라주세요'); return false; }
      const v = { title: fd.get('title').trim(), amount, cat: fd.get('cat'), payer: fd.get('payer'), split, day: +fd.get('day') || 0, pid: fd.get('pid') || '', cur, orig: cur === 'KRW' ? 0 : raw, rate: cur === 'KRW' ? 0 : r.fx[cur] };
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
  form.pid.addEventListener('change', () => { const o = form.pid.selectedOptions[0]; if (o?.dataset.d) form.day.value = o.dataset.d; });
  const amt = form.amount, per = $('.per', form);
  const upd = () => {
    const c = form.cur?.value || 'KRW', raw = +amt.value.replace(/[^\d.]/g, ''), rate = c === 'KRW' ? 1 : r.fx?.[c];
    const n = raw * (rate || 0), k = $$('input[name=split]:checked', form).length;
    per.textContent = c !== 'KRW' && !rate ? '이 통화의 환율을 먼저 정해주세요' : n ? `${c !== 'KRW' ? `≈ ${won(n)} (${fxLabel(c, rate)})` : ''}${c !== 'KRW' && k ? ' · ' : ''}${k ? `${k}명이 나누면 1인 ${won(n / k)}` : ''}` : '';
  };
  amt.addEventListener('input', () => { const t = amt.value.replace(/[^\d.]/g, ''); const [a, b] = t.split('.'); amt.value = a ? (+a).toLocaleString('ko-KR') + (b !== undefined ? '.' + b.slice(0, 2) : '') : ''; upd(); });
  $('[data-fx]', form)?.addEventListener('click', () => { closeModal(); fxModal(r); });
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
function vaultSeg(r, cur) {
  return `<div class="seg vault-seg" role="tablist"><button class="${cur === 'docs' ? 'on' : ''}" data-act="tab" data-k="docs">${I('ticket', 15)}티켓·서류 <span class="faint">${(r.docs || []).length}</span></button><button class="${cur === 'journal' ? 'on' : ''}" data-act="tab" data-k="journal">${I('camera', 15)}사진·기록 <span class="faint">${r.journal.length}</span></button></div>`;
}
function docsTab(r) {
  const list = (r.docs || []).slice().sort((a, b) => (a.day || 99) - (b.day || 99) || (b.at || 0) - (a.at || 0));
  const receipts = r.expenses.filter((e) => e.photos?.length);
  return `${vaultSeg(r, 'docs')}<div class="sec"><div><h2>티켓 · 서류</h2><p>항공권, 숙소 예약, 입장권 캡처를 한곳에. ${shared(r) ? '일행 모두가 함께 봐요.' : '함께 보는 여행방으로 열면 일행도 볼 수 있어요.'}</p></div>
    <div class="acts"><button class="btn pri" data-act="add-doc">${I('plus')}올리기</button></div></div>
  ${list.length ? `<div class="docs">${list.map((d) => { const k = dkind(d.kind), w = member(r, d.by); return `<button class="doc" data-act="open-doc" data-id="${d.id}">
      <div class="doc-thumb">${d.photos?.[0] ? ph(d.photos[0], esc(d.title), false) : `<span class="ill">${I('ticket', 28, 1.4)}</span>`}${d.photos?.length > 1 ? `<span class="more">+${d.photos.length - 1}</span>` : ''}</div>
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
      <label class="field"><span>언제 쓰나요 <small>· 선택</small></span><select name="day"><option value="">날짜 없음</option>${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}">${i + 1}일차${dl(r, i + 1)}</option>`).join('')}</select></label>
      <label class="field"><span>메모 <small>· 예약번호, 체크인 시간 등</small></span><textarea name="note" maxlength="300" style="min-height:70px"></textarea></label>`,
    ok: '올리기',
    onOk(f) {
      const fd = new FormData(f), files = fd.getAll('files').filter((x) => x.size).slice(0, 6);
      if (!files.length) { toast('사진을 골라주세요'); return false; }
      toast(shared(r) ? '올리는 중…' : '저장하는 중…');
      Promise.all(files.map((x) => shrink(x, 1600, 0.82))).then((l) => uploadPhotos(r, l.filter(Boolean))).then((photos) => {
        const d = { id: uid(), title: fd.get('title').trim(), kind: fd.get('kind'), day: +fd.get('day') || null, note: fd.get('note').trim(), photos, by: meId(r), at: now() };
        if (!photos.length) return toast('사진을 읽지 못했어요. 다른 사진으로 다시 올려주세요.');
        r.docs.push(d); d.upd = now(); r.updatedAt = d.upd;
        if (!save()) { r.docs.pop(); return render(); }
        queuePush(r); go(`#/r/${r.id}/docs`); render(); toast(shared(r) ? '보관함에 넣었어요. 일행도 볼 수 있어요' : '보관함에 넣었어요');
      }).catch((e) => toast(e.message || '올리지 못했어요'));
    },
  });
}
function docView(r, d) {
  const k = dkind(d.kind);
  const f = openModal({
    title: esc(d.title),
    body: `<div class="row wrap" style="gap:8px"><span class="tag"><span class="dot" style="--c:${k.c}"></span>${k.n}</span>${d.day ? `<span class="tag accent">${d.day}일차${dl(r, d.day)}</span>` : ''}<span class="faint" style="font-size:12px">${esc(member(r, d.by).name)} · ${timeAgo(d.at)}</span></div>
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
  return `${vaultSeg(r, 'journal')}<div class="sec"><div><h2>여행 기록</h2><p>그날의 기분과 사진을 남겨요. ${shared(r) ? '사진도 일행 모두가 함께 봐요.' : '사진은 이 기기에만 저장돼요.'}</p></div>
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
  const cur = undated(r) ? 1 : Math.min(dayCount(r), Math.max(1, Math.round((new Date(today) - new Date(r.start)) / 864e5) + 1));
  openModal({
    title: '오늘의 기록',
    body: `<label class="field"><span>날짜</span><select name="day">${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}" ${i + 1 === cur ? 'selected' : ''}>${i + 1}일차${dl(r, i + 1)}</option>`).join('')}</select></label>
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
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      // 서버 한도(약 900KB) 안에 들어오도록 화질 → 크기 순으로 줄여요
      let out = c.toDataURL('image/jpeg', q), qq = q;
      while (out.length > 880000 && qq > 0.5) { qq -= 0.1; out = c.toDataURL('image/jpeg', qq); }
      while (out.length > 880000 && c.width > 400) { const t = document.createElement('canvas'); t.width = c.width * 0.8; t.height = c.height * 0.8; t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); c.width = t.width; c.height = t.height; c.getContext('2d').drawImage(t, 0, 0); out = c.toDataURL('image/jpeg', qq); }
      res(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('열 수 없는 사진 형식이에요. JPG·PNG로 바꿔 올려주세요.'); res(''); };
    img.src = url;
  });
}

// ───── 설정 ─────
// 홈 화면에 설치 (안드로이드·PC 크롬은 버튼으로, 아이폰은 안내로)
let installEvt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; });
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function installRow() {
  if (standalone()) return '';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!installEvt && !ios) return '';
  return `<div class="group-title">앱으로 쓰기</div><div class="group"><div class="item"><div class="grow"><b>홈 화면에 추가</b><div class="faint" style="font-size:13px">${ios ? 'Safari 아래 공유 버튼 → "홈 화면에 추가"를 눌러주세요.' : '앱처럼 바로 열리고, 인터넷이 약해도 일정·티켓을 볼 수 있어요.'}</div></div>${ios ? '' : '<button class="btn sm" data-act="install">설치</button>'}</div></div>`;
}
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

// ───── 엑셀 주고받기 (SheetJS는 필요할 때만 불러와요) ─────
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return (loadXLSX.p ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => res(window.XLSX); s.onerror = () => { loadXLSX.p = null; rej(new Error('엑셀 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.')); };
    document.head.appendChild(s);
  }));
}
const XL = {
  places: ['일차', '순서', '시간', '이름', '분류', '주소', '메모', '하트', '다녀옴', '제안한 사람', 'ID'],
  expenses: ['일차', '항목', '금액', '분류', '낸 사람', '나눈 사람', '장소', '1인 금액', 'ID', '현지 금액', '환율'],
  checklist: ['항목', '담당', '챙김', 'ID'],
};
async function exportExcel(r) {
  const X = await loadXLSX();
  const mn = (id) => (id ? member(r, id).name : '');
  const sheet = (head, rows, widths) => { const ws = X.utils.aoa_to_sheet([head, ...rows]); ws['!cols'] = widths.map((w) => ({ wch: w })); return ws; };
  const places = r.places.slice().sort((a, b) => (a.day || 99) - (b.day || 99) || sortPlan(a, b))
    .map((p) => [p.day || '', p.day ? dayItems(r, p.day).indexOf(p) + 1 : '', p.time || '', p.name, cat(p.cat).n, p.addr || '', p.memo || '', p.hearts.length, p.visited ? 'O' : '', mn(p.by), p.id]);
  const exps = r.expenses.slice().sort((a, b) => expDay(r, a) - expDay(r, b) || a.at - b.at)
    .map((e) => [expDay(r, e) || '공통', e.title, e.amount, ecat(e.cat).n, mn(e.payer), e.split.map(mn).join(', '), (e.pid && r.places.find((p) => p.id === e.pid)?.name) || '', Math.round(e.amount / Math.max(1, e.split.length)), e.id, e.cur && e.cur !== 'KRW' && curOf(e.cur) ? fmtCur(e.cur, e.orig) : '', e.rate || '']);
  const { tx, bal } = settle(r);
  const info = [['여행 이름', r.name], ['여행지', r.dest || '미정'], ['날짜', range(r)], ['기간', nights(r)], ['일행', r.members.map((m) => m.name).join(', ')], [],
    ['총 지출', r.expenses.reduce((s, e) => s + e.amount, 0)], [], ['정산', '', ''], ['보내는 사람', '받는 사람', '금액'], ...tx.map((t) => [mn(t.from), mn(t.to), t.amt]), [],
    ['사람별', '낸 돈', '받을(+)/보낼(-) 돈'], ...r.members.map((m) => [m.name, r.expenses.filter((e) => e.payer === m.id).reduce((s, e) => s + e.amount, 0), Math.round(bal[m.id] || 0)]), [],
    ['※ 장소·지출·준비물 시트를 고친 뒤 모아여행에서 "엑셀 올리기"를 하면 반영돼요. ID 칸은 지우지 마세요(새 줄은 비워두면 돼요).']];
  const wb = X.utils.book_new();
  const wi = X.utils.aoa_to_sheet(info); wi['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 18 }];
  X.utils.book_append_sheet(wb, wi, '여행 정보');
  X.utils.book_append_sheet(wb, sheet(XL.places, places, [5, 5, 7, 22, 6, 30, 30, 5, 6, 10, 12]), '장소·일정');
  X.utils.book_append_sheet(wb, sheet(XL.expenses, exps, [6, 20, 10, 6, 8, 20, 16, 10, 12, 12, 8]), '지출');
  X.utils.book_append_sheet(wb, sheet(XL.checklist, r.checklist.map((c) => [c.text, mn(c.who) || '공용', c.done ? 'O' : '', c.id]), [24, 8, 6, 12]), '준비물');
  X.writeFile(wb, `모아여행-${r.name}.xlsx`);
  toast('엑셀 파일을 받았어요');
}
function importExcel(r) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    try {
      const X = await loadXLSX();
      const wb = X.read(await f.arrayBuffer());
      const rows = (re) => { const n = wb.SheetNames.find((x) => re.test(x)) || (wb.SheetNames.length === 1 ? wb.SheetNames[0] : null); return n ? X.utils.sheet_to_json(wb.Sheets[n], { defval: '' }) : []; };
      applyExcel(r, rows(/장소|일정|place/i), rows(/지출|정산|expense|money/i), rows(/준비|pack|check/i));
    } catch (e) { toast(e.message || '엑셀 파일을 읽지 못했어요'); }
  };
  inp.click();
}
async function applyExcel(r, pr, er, cr) {
  const str = (v) => String(v ?? '').trim();
  const num = (v) => +String(v ?? '').replace(/[^\d.-]/g, '') || 0;
  const yes = (v) => /^(o|y|yes|true|1|v|✓|✔|완료|챙김)$/i.test(str(v));
  const n = dayCount(r), me = meId(r);
  const findCat = (list, v, d) => list.find((c) => c.n === str(v) || c.k === str(v))?.k || d;
  const newMembers = [];
  const mid = (name) => { name = str(name); if (!name || name === '공용') return null; let m = r.members.find((x) => x.name === name); if (!m) { m = { id: uid(), name: name.slice(0, 12), color: COLORS[r.members.length % COLORS.length], upd: now() }; r.members.push(m); newMembers.push(m.name); } return m.id; };
  const plan = { pAdd: [], pUpd: [], eAdd: [], eUpd: [], cAdd: [], cUpd: [] };
  pr.forEach((x) => {
    const name = str(x['이름']); if (!name) return;
    const day = Math.round(num(x['일차'])); const v = { name: name.slice(0, 60), cat: findCat(CATS, x['분류'], 'etc'), addr: str(x['주소']), memo: str(x['메모']), time: /^\d{1,2}:\d{2}$/.test(str(x['시간'])) ? str(x['시간']).padStart(5, '0') : '', day: day >= 1 && day <= n ? day : null, order: num(x['순서']) || 0, visited: yes(x['다녀옴']) };
    const old = r.places.find((p) => p.id === str(x.ID)) || r.places.find((p) => p.name === name);
    if (old) {
      if (v.day === (old.day || null) && v.order === dayItems(r, old.day || 0).indexOf(old) + 1) delete v.order;
      if (Object.keys(v).every((k) => String(old[k] ?? '') === String(v[k] ?? '') || (k === 'visited' && !!old.visited === v.visited))) return;
    }
    (old ? plan.pUpd : plan.pAdd).push([old, v]);
  });
  er.forEach((x) => {
    const title = str(x['항목']), amount = Math.round(num(x['금액'])); if (!title || !amount) return;
    const day = Math.round(num(x['일차']));
    const v = { title: title.slice(0, 60), amount, cat: findCat(ECATS, x['분류'], 'etc'), _payer: x['낸 사람'], _split: str(x['나눈 사람']), _place: str(x['장소']), day: day >= 1 && day <= n ? day : 0 };
    const old = r.expenses.find((e) => e.id === str(x.ID));
    if (old) { const nm = (id) => member(r, id).name; const same = old.title === v.title && old.amount === v.amount && old.cat === v.cat && expDay(r, old) === v.day && nm(old.payer) === str(v._payer) && old.split.map(nm).join(', ') === v._split.split(/[,，、/]/).map(str).join(', ') && ((old.pid && r.places.find((q) => q.id === old.pid)?.name) || '') === v._place; if (same) return; }
    (old ? plan.eUpd : plan.eAdd).push([old, v]);
  });
  cr.forEach((x) => {
    const text = str(x['항목']); if (!text) return;
    const old = r.checklist.find((c) => c.id === str(x.ID)) || r.checklist.find((c) => c.text === text);
    if (old && old.text === text && !!old.done === yes(x['챙김']) && ((old.who && member(r, old.who).name) || '공용') === (str(x['담당']) || '공용')) return;
    (old ? plan.cUpd : plan.cAdd).push([old, { text: text.slice(0, 60), _who: x['담당'], done: yes(x['챙김']) }]);
  });
  const parts = [['장소', plan.pAdd, plan.pUpd], ['지출', plan.eAdd, plan.eUpd], ['준비물', plan.cAdd, plan.cUpd]].filter(([, a, u]) => a.length || u.length)
    .map(([k, a, u]) => `${k} ${a.length ? `${a.length}개 추가` : ''}${a.length && u.length ? ' · ' : ''}${u.length ? `${u.length}개 수정` : ''}`);
  if (!parts.length) return toast(pr.length || er.length || cr.length ? '바뀐 내용이 없어요' : '반영할 내용을 찾지 못했어요. 모아여행에서 받은 엑셀 양식인지 확인해 주세요.');
  if (!(await confirmBox({ title: '엑셀 내용을 반영할까요?', msg: `${parts.join('<br>')}<br><br>엑셀에 없는 기존 항목은 지우지 않아요.`, ok: '반영하기' }))) return;
  const t = now();
  plan.pAdd.forEach(([, v]) => r.places.push({ id: uid(), ...v, by: me, hearts: [me], comments: [], at: t, upd: t }));
  plan.pUpd.forEach(([p, v]) => { Object.assign(p, v); p.upd = t; });
  const pidOf = (name) => (name ? r.places.find((p) => p.name === name)?.id || '' : '');
  const expV = (v) => { const split = v._split ? v._split.split(/[,，、/]/).map(mid).filter(Boolean) : r.members.map((m) => m.id); const o = { title: v.title, amount: v.amount, cat: v.cat, day: v.day, payer: mid(v._payer) || me, split: split.length ? split : r.members.map((m) => m.id), pid: pidOf(v._place) }; return o; };
  plan.eAdd.forEach(([, v]) => r.expenses.push({ id: uid(), ...expV(v), photos: [], at: t, upd: t }));
  plan.eUpd.forEach(([e, v]) => { Object.assign(e, expV(v)); e.upd = t; });
  plan.cAdd.forEach(([, v]) => r.checklist.push({ id: uid(), text: v.text, who: mid(v._who), done: v.done, upd: t }));
  plan.cUpd.forEach(([c, v]) => { Object.assign(c, { text: v.text, who: mid(v._who), done: v.done }); c.upd = t; });
  sysMsg(r, `${member(r, me).name}님이 엑셀로 ${parts.join(', ')}했어요`);
  touch(r); render(); toast(`반영했어요${newMembers.length ? ` · 새 일행: ${newMembers.join(', ')}` : ''}`);
  // 위치가 없는 새 장소는 지도 검색으로 좌표를 채워요 (최대 20곳)
  const need = r.places.filter((p) => !p.lat && p.name).slice(0, 20);
  if (!need.length) return;
  toast(`장소 ${need.length}곳의 위치를 찾는 중…`);
  let ok = 0;
  for (const p of need) {
    try { const res = await searchPlaces(`${r.dest || ''} ${p.name} ${p.addr || ''}`.trim(), r); const hit = res?.items?.[0]; if (hit?.lat) { Object.assign(p, { lat: hit.lat, lng: hit.lng, addr: p.addr || hit.addr || '', kid: hit.kid, gid: hit.gid, upd: now() }); ok++; } } catch (e) { /* 다음 장소 */ }
  }
  touch(r); render(); toast(`위치를 ${ok}/${need.length}곳 찾았어요${ok < need.length ? '. 못 찾은 곳은 주소를 적어주세요' : ''}`);
}

function settingsTab(r) {
  const k = mapKeys(), pv = provider(r);
  return `<div class="sec"><div><h2>여행방 설정</h2><p>기본 정보, 일행, 지도와 공유를 관리해요.</p></div></div>
  <div class="group-title">기본 정보</div>
  <form class="group" data-form="room" style="padding:18px;display:flex;flex-direction:column;gap:14px">
    <label class="field"><span>여행 이름</span><input type="text" name="name" required maxlength="40" value="${esc(r.name)}"></label>
    <label class="field"><span>여행지 <small>· 비워두면 '아직 정하는 중'</small></span><input type="text" name="dest" maxlength="30" value="${esc(r.dest)}"></label>
    ${dateFields(r.start || isoDate(addDays(isoDate(new Date()), 14)), r.end || isoDate(addDays(isoDate(new Date()), 16)), undated(r), dayCount(r))}
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
    <div class="item"><div class="grow"><b>엑셀로 주고받기</b><div class="faint" style="font-size:13px">장소·일정·지출·준비물을 엑셀로 받아 고치고, 다시 올리면 반영돼요. 구글 시트에서도 열려요.</div></div><div class="row" style="gap:6px;flex:none"><button class="btn sm" data-act="xl-out">${I('down2', 15)}받기</button><button class="btn sm" data-act="xl-in">${I('upload', 15)}올리기</button></div></div>
    <div class="item"><div class="grow"><b>가져오기</b><div class="faint" style="font-size:13px">받은 링크나 백업 파일을 합쳐요</div></div><button class="btn sm" data-act="import">${I('upload', 15)}가져오기</button></div>
  </div>

  ${installRow()}
  <div class="group-title" style="color:var(--danger)">위험 구역</div>
  <div class="group"><div class="item"><div class="grow"><b>이 여행방 지우기</b><div class="faint" style="font-size:13px">이 기기에서만 지워져요. 친구들 기기에는 남아 있어요.</div></div><button class="btn sm danger" data-act="del-room">지우기</button></div>
    ${shared(r) && S.sync[r.id].admin ? `<div class="item"><div class="grow"><b>서버에서 완전히 삭제</b><div class="faint" style="font-size:13px">방장만 할 수 있어요. 서버의 여행방과 사진이 모두 지워져 일행도 더 이상 열 수 없어요.</div></div><button class="btn sm danger" data-act="wipe-room">완전 삭제</button></div>` : ''}</div>`;
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
function dateFields(start, end, nodate, days) {
  return `<div class="field datefields ${nodate ? 'nodate' : ''}"><div class="row" style="justify-content:space-between"><span>언제 가나요?</span>
      <label class="chip ${nodate ? 'on' : ''}" style="height:30px"><input type="checkbox" name="nodate" ${nodate ? 'checked' : ''} data-nodate>아직 몰라요</label></div>
    <div class="grid2 when-dated"><label class="field"><span>출발</span><input type="date" name="start" ${nodate ? '' : 'required'} value="${start}"></label><label class="field"><span>도착</span><input type="date" name="end" ${nodate ? '' : 'required'} value="${end}"></label></div>
    <label class="field when-undated"><span>며칠 정도 생각해요? <small>· 일정은 1일차, 2일차로 먼저 짜둘 수 있어요</small></span><select name="days">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${+days === i + 1 ? 'selected' : ''}>${i ? `${i}박 ${i + 1}일` : '당일'}</option>`).join('')}</select></label></div>`;
}
document.addEventListener('change', (ev) => {
  const c = ev.target.closest?.('[data-nodate]'); if (!c) return;
  const box = c.closest('.datefields'); box.classList.toggle('nodate', c.checked); c.parentElement.classList.toggle('on', c.checked);
  $$('.when-dated input', box).forEach((x) => (x.required = !c.checked));
});
// 함께 정하기: 날짜·여행지 후보에 "좋아요/가능해요" 표시하고 확정
function decideCard(r) {
  const needDate = undated(r), needDest = !r.dest;
  if (!needDate && !needDest) return '';
  const me = meId(r);
  const opts = (k) => (r[k] || []).slice().sort((a, b) => (b.votes || []).length - (a.votes || []).length || a.at - b.at);
  const row = (k, o, label, sub) => { const v = o.votes || [], on = v.includes(me), top = v.length && v.length === Math.max(...(r[k] || []).map((x) => (x.votes || []).length));
    return `<div class="opt ${top ? 'top' : ''}"><div class="grow"><b>${label}</b>${sub ? `<span class="faint"> ${sub}</span>` : ''}
      <div class="opt-votes">${v.length ? `<span class="avs">${v.map((id) => av(member(r, id), 20)).join('')}</span><span class="faint">${v.length}명</span>` : '<span class="faint">아직 아무도</span>'}</div></div>
      <button class="btn sm ${on ? 'pri' : ''}" data-act="vote-opt" data-k="${k}" data-id="${o.id}" aria-pressed="${on}">${on ? I('check', 14, 2.4) : ''}${k === 'dateOpts' ? '가능해요' : '좋아요'}</button>
      <button class="btn sm ghost" data-act="pick-opt" data-k="${k}" data-id="${o.id}" title="이걸로 확정">확정</button>
      ${o.by === me ? `<button class="btn ghost icon sm" data-act="del-opt" data-k="${k}" data-id="${o.id}" aria-label="후보 지우기">${I('x', 14)}</button>` : ''}</div>`; };
  const col = (k, title, hint, list, add) => `<div class="decide-col"><div class="row"><h3>${title}</h3><span class="sp"></span></div><p class="faint">${hint}</p>
    ${list.length ? `<div class="opts">${list}</div>` : ''}${add}</div>`;
  const dates = opts('dateOpts').map((o) => { const d = Math.round((new Date(o.end) - new Date(o.start)) / 864e5); return row('dateOpts', o, fmtRange(o.start, o.end), `${WD[addDays(o.start, 0).getDay()]}–${WD[addDays(o.end, 0).getDay()]} · ${d ? `${d}박 ${d + 1}일` : '당일'}`); }).join('');
  const dests = opts('destOpts').map((o) => row('destOpts', o, esc(o.name), o.note ? esc(o.note) : '')).join('');
  return `<section class="card decide"><div class="decide-h">${I('spark', 18)}<b>아직 정하는 중이에요</b><span class="faint">후보를 올리고, 되는 날·가고 싶은 곳에 표시해요. 표가 모이면 확정!</span></div>
    <div class="decide-g">
      ${needDest ? col('destOpts', '어디로 갈까?', '가고 싶은 곳을 후보로 올려요.', dests, `<form class="row" data-form="destopt" style="margin-top:10px"><input type="text" name="t" maxlength="30" placeholder="예: 강릉, 오사카" class="grow" aria-label="여행지 후보"><button class="btn sm">${I('plus', 14)}후보</button></form>`) : ''}
      ${needDate ? col('dateOpts', '언제 갈까?', `${nights({ ...r, start: '', end: '' }).replace(' 예정', '')} 정도로 생각 중이에요. 되는 날짜를 후보로 올려요.`, dates, `<button class="btn sm" data-act="add-date-opt" style="margin-top:10px">${I('plus', 14)}날짜 후보 추가</button>`) : ''}
    </div></section>`;
}
function dateOptModal(r) {
  const s = isoDate(addDays(isoDate(new Date()), 14));
  openModal({
    title: '날짜 후보 추가',
    body: `<div class="grid2"><label class="field"><span>출발</span><input type="date" name="start" required value="${s}"></label><label class="field"><span>도착</span><input type="date" name="end" required value="${isoDate(addDays(s, dayCount(r) - 1))}"></label></div>
      <p class="faint" style="margin:0;font-size:13px">올리면 나도 '가능해요'로 표시돼요.</p>`,
    ok: '후보 올리기',
    onOk(f) {
      if (f.end.value < f.start.value) { toast('도착일이 출발일보다 빨라요'); return false; }
      const o = { id: uid(), start: f.start.value, end: f.end.value, by: meId(r), votes: [meId(r)], at: now() };
      (r.dateOpts ||= []).push(o); sysMsg(r, `${member(r, meId(r)).name}님이 날짜 후보 ${fmtRange(o.start, o.end)}을(를) 올렸어요`); touch(r, o); render();
    },
  });
}
function roomModal() {
  const s = isoDate(addDays(isoDate(new Date()), 14));
  const t0 = Math.floor(Math.random() * TONES.length);
  openModal({
    title: '새 여행 만들기',
    body: `<label class="field"><span>어디로 가나요? <small>· 아직 모르면 비워두세요, 같이 정할 수 있어요</small></span><input type="text" name="dest" maxlength="30" placeholder="제주, 오사카, 강릉…"></label>
      <label class="field"><span>여행 이름</span><input type="text" name="name" maxlength="40" placeholder="비워두면 '우리의 ○○ 여행'"></label>
      ${dateFields(s, isoDate(addDays(s, 2)), false, 3)}
      <div class="field"><span>커버 색</span><div class="tones">${TONES.map((t, i) => `<label class="tone ${i === t0 ? 'on' : ''}" style="--tone:${t[0]}"><input type="radio" name="tone" value="${i}" ${i === t0 ? 'checked' : ''} aria-label="색 ${i + 1}"></label>`).join('')}</div></div>
      <label class="field"><span>내 이름</span><input type="text" name="me" required maxlength="12" placeholder="친구들이 부르는 이름"></label>
      <label class="field"><span>함께 가는 사람 <small>· 쉼표로 구분, 나중에 추가해도 돼요</small></span><input type="text" name="others" placeholder="유진, 민수, 지우"></label>`,
    ok: '여행방 만들기',
    onOk(f) {
      const d = Object.fromEntries(new FormData(f)), nodate = !!d.nodate;
      if (!nodate && d.end < d.start) { toast('도착일이 출발일보다 빨라요'); return false; }
      const others = d.others.split(/[,，、\n]/).map((x) => x.trim()).filter(Boolean);
      const dest = d.dest.trim();
      const r = newRoom({ name: d.name.trim() || (dest ? `우리의 ${dest} 여행` : '우리의 다음 여행'), dest, start: nodate ? '' : d.start, end: nodate ? '' : d.end, members: [d.me.trim(), ...others], tone: +d.tone });
      if (nodate) r.days = +d.days || 3;
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
          try { const inc = cleanRoom(JSON.parse(t)); if (!inc.id || !inc.members) throw 0; S.rooms[inc.id] = S.rooms[inc.id] ? mergeRoom(S.rooms[inc.id], inc) : inc; save(); toast('가져왔어요'); go(`#/r/${inc.id}/places`); } catch (e) { toast('모아여행 파일이 아니에요'); }
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
      ${navTabs(r).filter((t) => !bnavKeys(r).includes(t.k)).map((t) => `<button type="button" data-t="${t.k}" style="${navOn(tab, t.k) ? 'font-weight:700' : ''}">${I(t.i)}${t.n}${counts(r, t.k)}</button>`).join('')}
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
    open: () => { const x = S.rooms[el.dataset.id]; go(`#/r/${el.dataset.id}/${x && !x.demo && tripToday(x) ? 'today' : 'places'}`); },
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
    notif: () => Notification.requestPermission().then((p) => { toast(p === 'granted' ? '창을 내려놔도 새 메시지를 알려드릴게요' : '알림이 꺼져 있어요. 브라우저 설정에서 켤 수 있어요'); render(); }),
    'add-place': () => placeModal(r),
    'place-menu': () => placeMenu(r, P(el.dataset.id)),
    'sel-place': () => {
      if (!r || ev.target.closest('input,textarea,select,form')) return;
      const p = P(el.dataset.id); if (!p) return;
      if (!p.lat) { selPlace(p.id, { focus: false }); return toast('위치 정보가 없는 장소예요'); }
      if (route().tab === 'plan' && ui.planDay && ui.planDay !== p.day) { ui.planDay = p.day || 0; render(); }
      if (route().tab === 'plan' && !ui.planMap && !isWide()) { ui.planMap = true; render(); }
      if (route().tab === 'places' && !isWide() && ui.view !== 'map') { ui.view = 'map'; render(); }
      selPlace(p.id);
    },
    'plan-day': () => {
      ui.planDay = +el.dataset.d; ui.mapDay = 0; render();
      $('.plan-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    'plan-map': () => { ui.planMap = !ui.planMap; render(); },
    'map-day': () => {
      if (ev.target.closest('input,select,textarea,a,label')) return;
      const d = +el.dataset.d; ui.mapDay = ui.mapDay === d ? 0 : d;
      if (ui.mapDay && ui.mapOff) { ui.mapOff = false; saveMapOff(); }
      render();
    },
    'map-toggle': () => { ui.mapOff = !ui.mapOff; saveMapOff(); render(); },
    pending: () => pendingDrawer(r, +el.dataset.d || 0),
    'place-detail': () => placeDetail(r, P(el.dataset.id)),
    'place-exps': () => { const p = P(el.dataset.id); if (p) placeExps(r, p); },
    'money-view': () => { ui.moneyView = el.dataset.k; try { localStorage.setItem('moa.moneyView', ui.moneyView); } catch (e) { /* noop */ } render(); },
    'sheet-exp-del': () => { const e = r.expenses.find((x) => x.id === el.dataset.id); if (e) removeUndo(r, 'expenses', e.id, `'${e.title}' 지출을`); },
    fx: () => fxModal(r, el.dataset.k),
    'plan-view': () => { ui.planView = el.dataset.k; try { localStorage.setItem('moa.planView', ui.planView); } catch (e) { /* noop */ } render(); },
    'sheet-del': () => { const p = P(el.dataset.id); if (p) removeUndo(r, 'places', p.id, `'${p.name}'을(를)`); },
    'xl-out': () => exportExcel(r).catch((e) => toast(e.message)),
    'xl-in': () => importExcel(r),
    install: () => { installEvt?.prompt(); installEvt?.userChoice.finally(() => { installEvt = null; render(); }); },
    'today-day': () => { ui.td = ui.td || {}; ui.td[r.id] = Math.max(1, Math.min(dayCount(r), +el.dataset.d)); render(); },
    'add-date-opt': () => dateOptModal(r),
    'vote-opt': () => { const o = (r[el.dataset.k] || []).find((x) => x.id === el.dataset.id); if (!o) return; const me = meId(r); o.votes = o.votes || []; const i = o.votes.indexOf(me); if (i >= 0) o.votes.splice(i, 1); else o.votes.push(me); touch(r, o); render(); },
    'del-opt': () => removeUndo(r, el.dataset.k, el.dataset.id, '후보를'),
    'pick-opt': async () => {
      const k = el.dataset.k, o = (r[k] || []).find((x) => x.id === el.dataset.id); if (!o) return;
      const label = k === 'dateOpts' ? fmtRange(o.start, o.end) : o.name;
      if (!(await confirmBox({ title: '이걸로 확정할까요?', msg: `${esc(label)}(으)로 정해요. 일행 모두에게 보여요. 나중에 여행방 설정에서 바꿀 수 있어요.`, ok: '확정하기' }))) return;
      if (k === 'dateOpts') { r.start = o.start; r.end = o.end; const n = dayCount(r); r.places.forEach((p) => { if (p.day > n) p.day = null; }); }
      else { const pv0 = provider(r); if (r.name === '우리의 다음 여행') r.name = `우리의 ${o.name} 여행`; r.dest = o.name; if (provider(r) !== pv0) { mapCtl?.destroy(); mapCtl = null; } }
      sysMsg(r, `${member(r, meId(r)).name}님이 ${k === 'dateOpts' ? '날짜를' : '여행지를'} ${label}(으)로 확정했어요 🎉`); touch(r); render(); toast('확정했어요');
    },
    locate: () => {
      if (!isWide() && ui.view !== 'map') { ui.view = 'map'; render(); }
      selPlace(el.dataset.id);
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
    visit: () => {
      const p = P(el.dataset.id); p.visited = !p.visited; touch(r, p); render();
      if (!p.visited) return;
      const nx = p.day && dayItems(r, p.day).find((x) => !x.visited);
      toast(nx ? `다녀왔어요 · 다음은 '${nx.name}'` : `'${p.name}' 다녀왔어요`, { label: '되돌리기', fn() { p.visited = false; touch(r, p); render(); } });
    },
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
    'add-exp': () => expModal(r, null, el.dataset.d ? { day: +el.dataset.d, pid: el.dataset.pid || '' } : {}),
    'jump-day': () => $(`#exp-d${el.dataset.d}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
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
    'wipe-room': async () => {
      if (!(await confirmBox({ title: '서버에서 완전히 삭제할까요?', msg: `'${esc(r.name)}'의 장소·일정·정산·사진이 서버에서 모두 지워져요. 일행도 더 이상 열 수 없고, 되돌릴 수 없어요.`, ok: '완전 삭제', danger: true }))) return;
      try { await api('DELETE', r.id); } catch (e) { if (e.status !== 404) return toast(e.message); }
      delete S.rooms[r.id]; delete S.me[r.id]; delete S.sync[r.id]; save(); go('#/'); toast('서버에서 완전히 지웠어요');
    },
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
  if (kind === 'destopt' && t) { const o = { id: uid(), name: t.slice(0, 30), by: meId(r), votes: [meId(r)], at: now() }; (r.destOpts ||= []).push(o); sysMsg(r, `${member(r, meId(r)).name}님이 여행지 후보 '${o.name}'을(를) 올렸어요`); touch(r, o); render(); return; }
  if (kind === 'sheet-add' && t) { sheetAdd(r, f); return; }
  if (kind === 'sheet-exp-add') {
    const a = +String(f.a.value).replace(/[^\d.]/g, ''); if (!t) return f.t.focus(); if (!a) return f.a.focus();
    const curs = Object.keys(r.fx || {}).filter((k) => curOf(k)), cur = tripToday(r) && curs[0] ? curs[0] : 'KRW', me = meId(r);
    const ne = { id: uid(), title: t.slice(0, 60), cat: 'food', payer: me, split: r.members.map((m) => m.id), day: tripToday(r), pid: '', photos: [], at: now(),
      ...(cur === 'KRW' ? { cur: 'KRW', amount: Math.round(a) } : { cur, orig: a, rate: r.fx[cur], amount: Math.round(a * r.fx[cur]) }) };
    r.expenses.push(ne); touch(r, ne); render(); $('.sheet-add [name=t]')?.focus(); return;
  }
  if (kind === 'chat' && t) { r.messages.push({ id: uid(), by: meId(r), text: t, at: now(), upd: now() }); touch(r); render(); $('.composer input')?.focus(); }
  if (kind === 'cmt' && t) { const p = r.places.find((x) => x.id === f.dataset.id); p.comments.push({ id: uid(), by: meId(r), text: t, at: now() }); touch(r, p); render(); $(`[data-form=cmt][data-id="${p.id}"] input`)?.focus({ preventScroll: true }); }
  if (kind === 'pack' && t) { const c = { id: uid(), text: t, who: f.who.value || null, done: false }; r.checklist.push(c); touch(r, c); render(); $('[data-form=pack] input')?.focus(); }
  if (kind === 'member' && t) { const m = { id: uid(), name: t.slice(0, 12), color: COLORS[r.members.length % COLORS.length] }; r.members.push(m); sysMsg(r, `${t}님이 일행에 추가됐어요`); touch(r, m); render(); }
  if (kind === 'room') {
    const d = Object.fromEntries(new FormData(f)), nodate = !!d.nodate;
    if (!nodate && d.end < d.start) return toast('도착일이 출발일보다 빨라요');
    const pv0 = provider(r);
    Object.assign(r, { name: d.name.trim(), dest: d.dest.trim(), start: nodate ? '' : d.start, end: nodate ? '' : d.end, days: nodate ? +d.days || 3 : r.days, tone: d.tone !== undefined ? +d.tone : r.tone });
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
document.addEventListener('mouseover', (ev) => { const c = ev.target.closest?.('.place[data-pid]'); if (c && c !== hover.el) { hover.el && hover.el.dataset.pid !== mapCtl?.sel && mapCtl?.hl(hover.el.dataset.pid, false); hover.el = c; mapCtl?.hl(c.dataset.pid, true); } });
document.addEventListener('mouseout', (ev) => { if (hover.el && !hover.el.contains(ev.relatedTarget)) { hover.el.dataset.pid !== mapCtl?.sel && mapCtl?.hl(hover.el.dataset.pid, false); hover.el = null; } });
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

// 지도 크기: 아래 손잡이를 끌어서 사람마다(기기마다) 조절, 두 번 누르면 기본 크기로
(() => {
  let st = null;
  const clampH = (h) => Math.round(Math.max(150, Math.min(innerHeight * 0.75, h)));
  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest?.('[data-grip]'); if (!g) return;
    const box = g.previousElementSibling; if (!box) return;
    e.preventDefault(); g.setPointerCapture(e.pointerId);
    st = { y: e.clientY, h: box.getBoundingClientRect().height, g }; g.classList.add('on');
  });
  document.addEventListener('pointermove', (e) => {
    if (!st) return;
    const h = clampH(st.h + e.clientY - st.y); st.cur = h;
    document.documentElement.style.setProperty('--map-h', h + 'px'); mapCtl?.resize();
  });
  const end = () => { if (!st) return; st.g.classList.remove('on'); if (st.cur) { S.mapH = st.cur; save(); } st = null; mapCtl?.resize(); };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  document.addEventListener('dblclick', (e) => { if (!e.target.closest?.('[data-grip]')) return; delete S.mapH; save(); document.documentElement.style.removeProperty('--map-h'); mapCtl?.resize(); toast('지도 크기를 기본으로 돌렸어요'); });
})();
