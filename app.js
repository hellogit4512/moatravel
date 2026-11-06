/* 모아여행 v2 — 함께 모아 만드는 우리 여행 (정적 웹앱, 데이터는 기기 저장 + 공유 링크로 합치기) */
'use strict';

// ---------- 상수 ----------
const KEY = 'moa.v2';
const COLORS = ['#0e9384', '#f08a4b', '#6c63ff', '#e2557a', '#2f80ed', '#c08a1e', '#3aa76d', '#8e5cc4', '#d9534f', '#1aa3b8'];
const CATS = [
  { k: 'spot', e: '🌿', n: '가볼 곳' }, { k: 'food', e: '🍜', n: '맛집' }, { k: 'cafe', e: '☕', n: '카페' },
  { k: 'stay', e: '🛏️', n: '숙소' }, { k: 'shop', e: '🛍️', n: '쇼핑' }, { k: 'etc', e: '📍', n: '기타' },
];
const ECATS = [
  { k: 'food', e: '🍽️', n: '식비' }, { k: 'move', e: '🚗', n: '교통' }, { k: 'stay', e: '🏨', n: '숙박' },
  { k: 'play', e: '🎟️', n: '관광' }, { k: 'shop', e: '🛍️', n: '쇼핑' }, { k: 'etc', e: '💸', n: '기타' },
];
const MOODS = ['😆', '🥰', '😌', '🤤', '😴', '🥲'];
const EMOJIS = ['🏝️', '🏔️', '🌸', '🍁', '❄️', '🏙️', '🌊', '🚗', '✈️', '⛺', '🍜', '🎡'];
const TABS = [
  { k: 'chat', n: '대화', i: '💬' }, { k: 'places', n: '모아둔 곳', i: '📍' }, { k: 'plan', n: '우리 일정', i: '🗓️' },
  { k: 'money', n: '정산', i: '💰' }, { k: 'pack', n: '준비물', i: '🎒' }, { k: 'journal', n: '여행 기록', i: '📸' },
  { k: 'room', n: '여행방', i: '⚙️' },
];
const PACK_TEMPLATE = ['신분증', '충전기 · 보조배터리', '세면도구', '상비약', '선크림', '갈아입을 옷', '우산', '여행용 멀티탭'];

// ---------- 상태 ----------
let S = load();
const ui = { filter: 'all', sort: 'new', view: 'list', openCmt: {}, packFilter: 'all' };
let map = null;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.rooms) return s;
  } catch (e) { /* 저장소 없음 */ }
  return { rooms: {}, me: {}, theme: 'auto' };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('저장 공간이 부족해요. 사진을 줄여주세요.'); }
}

// ---------- 유틸 ----------
const $ = (s, el = document) => el.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const now = () => Date.now();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';
const cat = (k) => CATS.find((c) => c.k === k) || CATS[5];
const ecat = (k) => ECATS.find((c) => c.k === k) || ECATS[5];
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d; };
const dayLabel = (room, n) => {
  const d = addDays(room.start, n - 1);
  return `${d.getMonth() + 1}.${pad(d.getDate())} (${'일월화수목금토'[d.getDay()]})`;
};
const dayCount = (r) => Math.min(30, Math.max(1, Math.round((new Date(r.end) - new Date(r.start)) / 864e5) + 1 || 1));
const range = (r) => `${r.start.slice(5).replace('-', '.')} — ${r.end.slice(5).replace('-', '.')} · ${dayCount(r)}일`;
const timeAgo = (t) => {
  const s = (now() - t) / 1000;
  if (s < 60) return '방금';
  if (s < 3600) return Math.floor(s / 60) + '분 전';
  if (s < 86400) return Math.floor(s / 3600) + '시간 전';
  const d = new Date(t); return `${d.getMonth() + 1}.${d.getDate()}`;
};
function dday(r) {
  const today = new Date(isoDate(new Date()) + 'T00:00:00');
  const s = new Date(r.start + 'T00:00:00'), e = new Date(r.end + 'T00:00:00');
  const diff = Math.round((s - today) / 864e5);
  if (diff > 0) return `D-${diff}`;
  if (today <= e) return `여행 ${Math.round((today - s) / 864e5) + 1}일차`;
  return '다녀온 여행';
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
async function copy(text, msg = '복사했어요') {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch (e) { prompt('아래 내용을 복사하세요', text); }
}
function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
}

// ---------- 방/멤버 ----------
const room = () => S.rooms[route().id];
const member = (r, id) => r.members.find((m) => m.id === id) || { id, name: '알 수 없음', color: '#999' };
const meId = (r) => S.me[r.id];
const av = (m, size) => `<span class="av" title="${esc(m.name)}" style="background:${m.color}${size ? `;width:${size}px;height:${size}px` : ''}">${esc(m.name.slice(0, 1))}</span>`;
function touch(r, item) { const t = now(); if (item) item.upd = t; r.updatedAt = t; save(); }
function remove(r, key, id) {
  r[key] = r[key].filter((x) => x.id !== id);
  r.del = r.del || {}; r.del[id] = now(); touch(r);
}
function sysMsg(r, text) { r.messages.push({ id: uid(), sys: true, text, at: now(), upd: now() }); }
function newRoom({ name, dest, emoji, start, end, members }) {
  const ms = members.map((n, i) => ({ id: uid(), name: n, color: COLORS[i % COLORS.length], upd: now() }));
  return {
    id: uid(), name, dest, emoji, start, end, members: ms, places: [], messages: [], expenses: [], checklist: [], journal: [],
    del: {}, createdAt: now(), updatedAt: now(),
  };
}
function demoRoom() {
  const start = isoDate(addDays(isoDate(new Date()), 7));
  const r = newRoom({ name: '우리의 느긋한 제주', dest: '제주', emoji: '🏝️', start, end: isoDate(addDays(start, 2)), members: ['나', '유진', '민수', '지우'] });
  r.id = 'demo'; r.demo = true;
  const [me, yu, mi, ji] = r.members.map((m) => m.id);
  const P = (name, c, addr, memo, by, hearts, day, lat, lng, order) => ({ id: uid(), name, cat: c, addr, memo, by, hearts, day, lat, lng, order, time: '', comments: [], at: now() - order * 6e5, upd: now() });
  r.places = [
    P('함덕해수욕장', 'spot', '제주 제주시 조천읍 함덕리', '첫날은 바다부터! 해 질 때 같이 산책하자.', yu, [yu, mi, ji], 1, 33.5432, 126.6697, 2),
    P('동문시장', 'food', '제주 제주시 관덕로14길', '먹고 싶은 거 하나씩 골라서 나눠 먹기', mi, [mi], 1, 33.5122, 126.5269, 1),
    P('비자림', 'spot', '제주 제주시 구좌읍 비자숲길', '여기는 천천히 걸어보고 싶어 🌿', ji, [ji], 2, 33.4900, 126.8090, 1),
    P('성산일출봉', 'spot', '제주 서귀포시 성산읍', '일출은 무리일까? 다들 의견 알려줘!', yu, [yu, me], null, 33.4581, 126.9425, 0),
    P('애월 바다 보이는 카페', 'cafe', '제주 제주시 애월읍', '마지막 날 공항 가기 전에 들르면 좋겠어.', mi, [mi], null, 33.4636, 126.3100, 0),
  ];
  r.places[0].time = '17:30'; r.places[1].time = '12:00';
  r.places[3].comments.push({ id: uid(), by: mi, text: '일출 말고 오후에 가도 좋을 듯!', at: now() - 3e6 });
  r.messages = [
    { id: uid(), by: yu, text: '드디어 제주 간다 🥹 가고 싶은 곳 다 모아두자!', at: now() - 9e6 },
    { id: uid(), by: mi, text: '난 동문시장은 무조건. 먹을 거 담당 할게', at: now() - 8e6 },
    { id: uid(), by: ji, text: '비자림 넣어뒀어. 2일차 오전 어때?', at: now() - 7e6 },
    { id: uid(), sys: true, text: '유진님이 \'성산일출봉\'을(를) 모았어요', at: now() - 6e6 },
  ];
  r.expenses = [
    { id: uid(), title: '항공권 (왕복)', amount: 412000, cat: 'move', payer: yu, split: [me, yu, mi, ji], at: now() - 5e6 },
    { id: uid(), title: '애월 독채 숙소 2박', amount: 380000, cat: 'stay', payer: mi, split: [me, yu, mi, ji], at: now() - 4e6 },
    { id: uid(), title: '렌터카', amount: 96000, cat: 'move', payer: me, split: [me, yu, mi, ji], at: now() - 3e6 },
  ];
  r.checklist = [
    { id: uid(), text: '신분증', who: null, done: false }, { id: uid(), text: '블루투스 스피커', who: mi, done: true },
    { id: uid(), text: '필름 카메라', who: ji, done: false }, { id: uid(), text: '렌터카 예약 확인', who: me, done: false },
  ];
  return r;
}

// ---------- 라우팅 ----------
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [a, id, tab] = h.split('/');
  if (a === 'r' && id) return { page: 'room', id, tab: TABS.some((t) => t.k === tab) ? tab : 'places' };
  return { page: 'home' };
}
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
window.addEventListener('hashchange', () => { checkJoin(); render(); scrollTo(0, 0); });

// ---------- 공유 링크 (압축 → 주소에 담기) ----------
const b64u = (bytes) => { let s = ''; bytes.forEach((b) => (s += String.fromCharCode(b))); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function encodeRoom(r) {
  const copyR = { ...r, journal: r.journal.map((j) => ({ ...j, photos: [] })) };
  delete copyR.demo;
  const bytes = new TextEncoder().encode(JSON.stringify(copyR));
  if (window.CompressionStream) return 'z' + b64u(await pipe(bytes, new CompressionStream('deflate-raw')));
  return 'p' + b64u(bytes);
}
async function decodeRoom(s) {
  const bytes = unb64u(s.slice(1));
  const raw = s[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
  return JSON.parse(new TextDecoder().decode(raw));
}
async function shareLink(r) {
  const base = location.href.split('#')[0];
  return `${base}#join=${await encodeRoom(r)}`;
}
function mergeRoom(a, b) {
  const del = { ...(a.del || {}), ...(b.del || {}) };
  const newer = (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a;
  const out = { ...newer, del };
  const photos = {}; (a.journal || []).forEach((j) => (photos[j.id] = j.photos));
  for (const k of ['members', 'places', 'messages', 'expenses', 'checklist', 'journal']) {
    const m = new Map();
    [...(a[k] || []), ...(b[k] || [])].forEach((x) => {
      const cur = m.get(x.id);
      if (!cur || (x.upd || x.at || 0) >= (cur.upd || cur.at || 0)) m.set(x.id, x);
    });
    out[k] = [...m.values()].filter((x) => !del[x.id]);
  }
  out.journal.forEach((j) => { if (!j.photos?.length && photos[j.id]) j.photos = photos[j.id]; });
  out.messages.sort((x, y) => x.at - y.at);
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  return out;
}
async function checkJoin() {
  const m = location.hash.match(/^#join=(.+)$/);
  if (!m) return;
  try {
    const incoming = await decodeRoom(m[1]);
    const exists = S.rooms[incoming.id];
    S.rooms[incoming.id] = exists ? mergeRoom(exists, incoming) : incoming;
    save();
    toast(exists ? '친구들의 최신 내용을 합쳤어요 ✨' : `'${incoming.name}' 여행방에 들어왔어요 🎉`);
    history.replaceState(null, '', location.pathname + `#/r/${incoming.id}/places`);
  } catch (e) {
    toast('링크를 읽지 못했어요. 링크가 잘렸는지 확인해 주세요.');
    history.replaceState(null, '', location.pathname + '#/');
  }
  render();
}

// ---------- 모달 ----------
function openModal({ title, body, ok = '저장', onOk, danger, wide }) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay"><form class="modal" ${wide ? 'style="width:min(640px,100%)"' : ''}>
    <div class="row between"><h2>${title}</h2><button type="button" class="btn ghost sm" data-close>✕</button></div>
    ${body}
    ${onOk ? `<div class="acts"><button type="button" class="btn" data-close>취소</button><button class="btn pri ${danger ? 'danger' : ''}" ${danger ? 'style="background:var(--danger);border-color:var(--danger)"' : ''}>${ok}</button></div>` : ''}
  </form></div>`;
  const form = $('form', root);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (onOk && onOk(form) !== false) closeModal();
  });
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  $('.overlay', root).addEventListener('mousedown', (e) => { if (e.target.classList.contains('overlay')) closeModal(); });
  setTimeout(() => form.querySelector('input:not([type=hidden]),textarea')?.focus(), 30);
  return form;
}
function closeModal() { $('#modal-root').innerHTML = ''; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ---------- 렌더 ----------
function render() {
  const rt = route();
  if (map) { map.remove(); map = null; }
  if (rt.page === 'room' && !S.rooms[rt.id]) {
    if (rt.id === 'demo') { S.rooms.demo = demoRoom(); S.me.demo = S.rooms.demo.members[0].id; save(); }
    else return go('#/');
  }
  const r = rt.page === 'room' ? S.rooms[rt.id] : null;
  document.title = r ? `${r.name} · 모아여행` : '모아여행 · 함께 모아 만드는 우리 여행';
  $('#app').innerHTML = `<div class="shell">${side(rt, r)}<main class="main">${r ? roomPage(r, rt.tab) : home()}</main></div>`;
  if (r && rt.tab === 'places' && ui.view === 'map') initMap(r);
  if (r && rt.tab === 'chat') { const el = $('.msgs'); if (el) el.scrollTop = el.scrollHeight; }
  if (r && !meId(r)) setTimeout(() => pickMe(r), 50);
}

function side(rt, r) {
  const rooms = Object.values(S.rooms).sort((a, b) => b.updatedAt - a.updatedAt);
  return `<aside class="side">
    <button class="logo" data-act="home"><img src="icon.svg" alt="">모아여행<b>.</b></button>
    <div class="tag">좋은 여행은<br>함께 모으는 것부터.</div>
    ${r ? `<div><div class="label">OUR LITTLE JOURNEY</div><nav class="nav">
      ${TABS.map((t) => `<button class="${rt.tab === t.k ? 'on' : ''}" data-act="tab" data-k="${t.k}"><span>${t.i}</span>${t.n}${counts(r, t.k)}</button>`).join('')}
    </nav></div>` : ''}
    <div><div class="label">내 여행들</div><nav class="nav">
      ${rooms.map((x) => `<button class="${r && r.id === x.id ? 'on' : ''}" data-act="open" data-id="${x.id}"><span>${x.emoji}</span><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.name)}</span></button>`).join('') || '<div class="faint" style="font-size:13px;padding:4px 12px">아직 여행방이 없어요</div>'}
      <button data-act="new-room"><span>＋</span>새 여행 만들기</button>
    </nav></div>
    <div class="foot">계획은 가볍게,<br>추억은 가득하게.
      <div style="margin-top:10px"><button class="btn sm ghost" data-act="theme">${S.theme === 'dark' ? '☀️ 밝게' : S.theme === 'light' ? '🌙 어둡게' : '🌗 자동 테마'}</button></div>
    </div>
  </aside>`;
}
function counts(r, k) {
  const n = { places: r.places.length, money: r.expenses.length, pack: r.checklist.filter((c) => !c.done).length, journal: r.journal.length }[k];
  return n ? `<span class="cnt">${n}</span>` : '';
}

// ---------- 홈 ----------
function home() {
  const rooms = Object.values(S.rooms).sort((a, b) => b.updatedAt - a.updatedAt);
  return `
  <div class="mtop"><button class="logo" data-act="home"><img src="icon.svg" alt="">모아여행<b>.</b></button><button class="btn sm ghost" data-act="theme">🌗</button></div>
  <div class="row between">
    <div><div class="eyebrow">OUR NEXT CHAPTER</div><h1>어디로 떠나볼까요?</h1><div class="muted">가고 싶은 마음을 모아, 우리만의 여행으로.</div></div>
    <button class="btn pri" data-act="new-room">＋ 새 여행 만들기</button>
  </div>
  <section class="card hero">
    <span class="pill">생각은 각자, 여행은 함께</span>
    <h2 style="margin-top:14px">단체톡에 흩어진 여행,<br><em>여기서 하나로 모아요.</em></h2>
    <p>장소를 제안하고, 하트를 누르고, 일정·정산·준비물까지<br>모두의 의견으로 완성해요.</p>
    <div class="row"><button class="btn pri" data-act="new-room">우리 여행방 만들기 →</button><button class="btn" data-act="open" data-id="demo">🏝️ 예시 둘러보기</button></div>
    ${islandSvg()}
  </section>
  <div class="sec-head"><div><h2>나의 여행방 <span class="pill">${rooms.filter((x) => !x.demo).length}</span></h2><div class="muted">함께 계획하는 설렘을 이어가세요.</div></div>
    <button class="btn sm" data-act="import">📥 파일·링크로 가져오기</button></div>
  ${rooms.length ? `<div class="rooms">${rooms.map(roomCard).join('')}</div>` : `<div class="card empty"><div class="big">🧳</div>아직 여행방이 없어요.<br>새 여행을 만들거나 친구가 보낸 링크를 열어보세요.</div>`}
  ${rooms.some((x) => x.demo) ? '' : `<div class="card room-card" style="margin-top:14px;flex-direction:row;align-items:center" data-act="open" data-id="demo">
    <div class="emo">🏝️</div><div class="grow"><div class="pill warm" style="display:inline-block">먼저 구경해볼까요?</div><h3 style="margin-top:4px">우리의 느긋한 제주</h3><div class="muted" style="font-size:13px">예시 여행방에서 제안 · 투표 · 일정 · 정산을 체험해보세요.</div></div><span class="btn sm">둘러보기 →</span></div>`}
  <div class="sec-head"><h2>함께 만드는 여행, 이렇게 간단해요</h2></div>
  <div class="steps">
    ${[['01', '링크 하나로 모이고', '단체톡에 초대 링크를 보내요. 설치도 가입도 필요 없어요.'], ['02', '각자의 취향을 모으고', '장소와 의견, 하트를 남기고 지도에서 한눈에 봐요.'], ['03', '일정·정산까지 완성해요', '날짜에 배치하고, 쓴 돈은 누가 누구에게 보낼지 자동 계산해요.']]
      .map(([n, t, d]) => `<div class="card step"><div class="n">${n}</div><h3>${t}</h3><div class="muted" style="font-size:14px">${d}</div></div>`).join('')}
  </div>
  <p class="faint" style="text-align:center;margin-top:40px;font-size:13px">조금 덜 바쁘게, 조금 더 우리답게. · 모아여행</p>`;
}
function roomCard(x) {
  return `<button class="card room-card" data-act="open" data-id="${x.id}">
    <div class="row between"><div class="emo">${x.emoji}</div><span class="pill ${x.demo ? 'warm' : ''}">${x.demo ? '예시' : dday(x)}</span></div>
    <div><h3>${esc(x.name)}</h3><div class="muted" style="font-size:13px">${esc(x.dest)} · ${range(x)}</div></div>
    <div class="row between"><div class="avs">${x.members.slice(0, 5).map((m) => av(m)).join('')}</div><span class="faint" style="font-size:12px">장소 ${x.places.length} · ${timeAgo(x.updatedAt)}</span></div>
  </button>`;
}
function islandSvg() {
  return `<svg class="island" viewBox="0 0 320 200" aria-hidden="true"><ellipse cx="170" cy="168" rx="150" ry="26" fill="var(--brand-soft)"/><ellipse cx="165" cy="160" rx="110" ry="20" fill="#e8d9b5"/><path d="M80 158 L150 50 L185 92 L205 70 L255 158Z" fill="var(--brand)" opacity=".85"/><path d="M150 50 L135 74 L150 70 L162 78 L170 66Z" fill="#fff" opacity=".9"/><rect x="118" y="132" width="20" height="18" fill="#fff"/><path d="M114 134 L128 122 L142 134Z" fill="var(--accent)"/><path d="M262 158 C262 120 268 100 276 90" stroke="#8a6a3a" stroke-width="4" fill="none"/><path d="M276 90 c-18 -6 -28 4 -34 10 M276 90 c16 -10 28 -4 34 4 M276 90 c-4 -16 4 -24 12 -28" stroke="#3aa76d" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="270" cy="40" r="14" fill="var(--accent)" opacity=".8"/></svg>`;
}

// ---------- 방 ----------
function roomPage(r, tab) {
  const me = meId(r) ? member(r, meId(r)) : null;
  return `
  <div class="mtop"><button class="btn sm ghost" data-act="home">← 내 여행들</button><button class="btn sm" data-act="share">🔗 초대·공유</button></div>
  <section class="card room-head">
    <div class="emo">${r.emoji}</div>
    <div class="grow">
      <div class="eyebrow">LET'S MAKE A JOURNEY</div>
      <h1 style="margin:2px 0">${esc(r.name)}</h1>
      <div class="muted">${esc(r.dest)} · ${range(r)}</div>
    </div>
    <div style="text-align:right">
      <div class="dday">${dday(r)}</div>
      <div class="row" style="justify-content:flex-end;margin-top:6px">
        <div class="avs">${r.members.map((m) => av(m)).join('')}</div>
        <button class="btn sm pri" data-act="share">🔗 초대·공유</button>
      </div>
      ${me ? `<button class="btn sm ghost" data-act="pick-me" style="margin-top:4px">나: ${esc(me.name)} ▾</button>` : ''}
    </div>
  </section>
  ${r.demo ? `<div class="banner">🧪 예시 여행방이에요. 여기서 한 변경은 내 기기에만 저장돼요. <button class="btn sm" data-act="fork-demo">이 내용으로 내 방 만들기</button><button class="btn sm ghost" data-act="reset-demo">처음 상태로</button></div>` : ''}
  <nav class="tabs">${TABS.map((t) => `<button class="${tab === t.k ? 'on' : ''}" data-act="tab" data-k="${t.k}">${t.i} ${t.n}</button>`).join('')}</nav>
  ${({ chat: chatTab, places: placesTab, plan: planTab, money: moneyTab, pack: packTab, journal: journalTab, room: settingsTab })[tab](r)}`;
}

// ----- 대화 -----
function chatTab(r) {
  const me = meId(r);
  return `<div class="sec-head"><div><h2>대화</h2><div class="muted">정해야 할 것, 떠오른 생각을 가볍게 남겨요.</div></div></div>
  <div class="card chat"><div class="msgs">
    ${r.messages.map((m) => {
      if (m.sys) return `<div class="msg sys"><div class="bub">${esc(m.text)} · ${timeAgo(m.at)}</div></div>`;
      const who = member(r, m.by);
      return `<div class="msg ${m.by === me ? 'me' : ''}">${av(who)}<div><div class="bub">${esc(m.text)}</div><div class="meta">${m.by === me ? '' : esc(who.name) + ' · '}${timeAgo(m.at)}</div></div></div>`;
    }).join('') || '<div class="empty"><div class="big">💬</div>첫 마디를 남겨보세요!</div>'}
  </div>
  <form class="composer" data-form="chat"><input type="text" name="t" placeholder="메시지를 입력하세요" autocomplete="off" maxlength="500"><button class="btn pri">보내기</button></form></div>
  <p class="faint" style="font-size:13px">💡 대화는 공유 링크를 주고받을 때 함께 합쳐져요.</p>`;
}

// ----- 모아둔 곳 -----
function placesTab(r) {
  let list = r.places.slice();
  if (ui.filter === 'none') list = list.filter((p) => !p.day);
  else if (ui.filter !== 'all') list = list.filter((p) => p.cat === ui.filter);
  list.sort(ui.sort === 'heart' ? (a, b) => b.hearts.length - a.hearts.length || b.at - a.at : (a, b) => b.at - a.at);
  const days = dayCount(r);
  return `<div class="sec-head"><div><h2>우리의 가고 싶은 곳 <span class="pill">${r.places.length}</span></h2><div class="muted">누구의 제안이든 좋아요. 마음에 들면 하트를 눌러주세요.</div></div>
    <button class="btn pri" data-act="add-place">＋ 장소 추가</button></div>
  <div class="row between" style="margin-bottom:14px">
    <div class="chips">
      <button class="chip ${ui.filter === 'all' ? 'on' : ''}" data-act="filter" data-k="all">전체</button>
      <button class="chip ${ui.filter === 'none' ? 'on' : ''}" data-act="filter" data-k="none">아직 미정</button>
      ${CATS.map((c) => `<button class="chip ${ui.filter === c.k ? 'on' : ''}" data-act="filter" data-k="${c.k}">${c.e} ${c.n}</button>`).join('')}
    </div>
    <div class="chips">
      <button class="chip ${ui.view === 'list' ? 'on' : ''}" data-act="view" data-k="list">목록</button>
      <button class="chip ${ui.view === 'map' ? 'on' : ''}" data-act="view" data-k="map">🗺️ 지도</button>
      ${ui.view === 'list' ? `<select data-change="sort" style="width:auto;padding:5px 10px;border-radius:99px;font-size:13px"><option value="new" ${ui.sort === 'new' ? 'selected' : ''}>최근 추가순</option><option value="heart" ${ui.sort === 'heart' ? 'selected' : ''}>하트 많은 순</option></select>` : ''}
    </div>
  </div>
  ${ui.view === 'map' ? `<div id="map"></div><p class="faint" style="font-size:13px">숫자 핀은 일정에 들어간 장소예요. 위치가 없는 장소는 '수정'에서 검색해 연결할 수 있어요.</p>` :
    list.length ? `<div class="list">${list.map((p) => placeCard(r, p, days)).join('')}</div>` : `<div class="card empty"><div class="big">📍</div>아직 모아둔 곳이 없어요.<br><button class="btn pri" data-act="add-place" style="margin-top:12px">첫 장소 제안하기</button></div>`}
  <p class="faint" style="text-align:center;font-size:13px;margin-top:18px">하트는 순위를 정하는 참고예요. 최종 일정은 함께 이야기해서 정해요.</p>`;
}
function placeCard(r, p, days) {
  const c = cat(p.cat), by = member(r, p.by), me = meId(r), on = p.hearts.includes(me), open = ui.openCmt[p.id];
  const q = encodeURIComponent(p.name + ' ' + (p.addr || ''));
  return `<article class="card place">
    <div class="top"><div class="ic">${c.e}</div><div class="grow">
      <div class="row" style="gap:6px;font-size:12px"><span class="muted">${c.n}</span><span class="faint">·</span>${av(by, 18)}<span class="muted">${esc(by.name)}님이 모았어요</span>${p.day ? `<span class="pill">${p.day}일차${p.time ? ' ' + p.time : ''}</span>` : ''}</div>
      <div class="name">${esc(p.name)}</div>
      ${p.addr ? `<div class="muted" style="font-size:13px">${esc(p.addr)}</div>` : ''}
      <div class="row" style="gap:8px;font-size:12px;margin-top:4px">
        <a href="https://map.naver.com/p/search/${q}" target="_blank" rel="noopener">네이버지도</a>
        <a href="https://map.kakao.com/?q=${q}" target="_blank" rel="noopener">카카오맵</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${p.lat ? p.lat + ',' + p.lng : q}" target="_blank" rel="noopener">구글지도</a>
        ${p.url ? `<a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">링크</a>` : ''}
        ${p.lat ? '' : '<span class="faint">· 위치 미연결</span>'}
      </div>
    </div></div>
    ${p.memo ? `<div class="memo">${esc(p.memo)}</div>` : ''}
    <div class="row between">
      <div class="row" style="gap:6px">
        <button class="heart ${on ? 'on' : ''}" data-act="heart" data-id="${p.id}">${on ? '♥' : '♡'} 가고 싶어요 ${p.hearts.length}</button>
        <div class="avs">${p.hearts.slice(0, 4).map((h) => av(member(r, h), 22)).join('')}</div>
      </div>
      <div class="row" style="gap:2px">
        <button class="btn sm ghost" data-act="cmt" data-id="${p.id}">의견 ${p.comments.length}</button>
        <button class="btn sm ghost" data-act="edit-place" data-id="${p.id}">수정</button>
      </div>
    </div>
    <div><div class="faint" style="font-size:12px;margin-bottom:4px">어느 날 갈까요?</div><div class="day-pick">
      <button class="${!p.day ? 'on' : ''}" data-act="set-day" data-id="${p.id}" data-d="0">미정</button>
      ${Array.from({ length: days }, (_, i) => `<button class="${p.day === i + 1 ? 'on' : ''}" data-act="set-day" data-id="${p.id}" data-d="${i + 1}">${i + 1}일차</button>`).join('')}
    </div></div>
    ${open ? `<div class="comments">
      ${p.comments.map((cm) => `<div class="cmt">${av(member(r, cm.by), 22)}<div class="grow"><b>${esc(member(r, cm.by).name)}</b> <span class="faint" style="font-size:12px">${timeAgo(cm.at)}</span><div>${esc(cm.text)}</div></div>${cm.by === me ? `<button class="btn sm ghost" data-act="del-cmt" data-id="${p.id}" data-c="${cm.id}">✕</button>` : ''}</div>`).join('') || '<div class="faint" style="font-size:13px">아직 의견이 없어요.</div>'}
      <form class="row" data-form="cmt" data-id="${p.id}"><input type="text" name="t" placeholder="의견 남기기" class="grow" style="flex:1" maxlength="300"><button class="btn sm pri">등록</button></form>
    </div>` : ''}
  </article>`;
}
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : 'https://' + u);

function placeModal(r, p) {
  const isNew = !p;
  p = p || { name: '', cat: 'spot', addr: '', memo: '', url: '', lat: null, lng: null, day: null };
  const form = openModal({
    title: isNew ? '가고 싶은 곳 제안하기' : '장소 수정',
    body: `
      <label class="f">장소 검색 <span class="faint" style="font-weight:400">— 위치를 연결하면 지도에 표시돼요</span>
        <div class="row"><input type="text" name="q" placeholder="예: ${esc(r.dest)} 흑돼지, 성산일출봉" class="grow" style="flex:1"><button type="button" class="btn" data-search>검색</button></div></label>
      <div class="results"></div>
      <label class="f">이름 <input type="text" name="name" required maxlength="60" value="${esc(p.name)}"></label>
      <div class="f" style="font-size:13px;font-weight:700;color:var(--muted)">분류<div class="chips" style="margin-top:6px">${CATS.map((c) => `<label class="chip ${p.cat === c.k ? 'on' : ''}" style="cursor:pointer"><input type="radio" name="cat" value="${c.k}" ${p.cat === c.k ? 'checked' : ''} hidden>${c.e} ${c.n}</label>`).join('')}</div></div>
      <label class="f">주소 <input type="text" name="addr" maxlength="120" value="${esc(p.addr)}"></label>
      <label class="f">한마디 <textarea name="memo" maxlength="300" placeholder="왜 가고 싶은지 남겨주세요">${esc(p.memo)}</textarea></label>
      <label class="f">참고 링크 (인스타, 블로그 등) <input type="url" name="url" value="${esc(p.url || '')}" placeholder="https://"></label>
      <input type="hidden" name="lat" value="${p.lat ?? ''}"><input type="hidden" name="lng" value="${p.lng ?? ''}">
      <div class="faint loc" style="font-size:12px">${p.lat ? '📍 위치 연결됨' : '위치 미연결'}</div>
      ${isNew ? '' : `<button type="button" class="btn sm danger" data-del style="align-self:flex-start">이 장소 삭제</button>`}`,
    ok: isNew ? '제안하기' : '저장',
    onOk(f) {
      const d = Object.fromEntries(new FormData(f));
      const v = { name: d.name.trim(), cat: d.cat, addr: d.addr.trim(), memo: d.memo.trim(), url: d.url.trim(), lat: d.lat ? +d.lat : null, lng: d.lng ? +d.lng : null };
      if (!v.name) return false;
      if (isNew) {
        const np = { id: uid(), ...v, by: meId(r), hearts: [meId(r)], comments: [], day: null, order: 0, time: '', at: now() };
        r.places.push(np);
        sysMsg(r, `${member(r, meId(r)).name}님이 '${v.name}'을(를) 모았어요`);
        touch(r, np); toast('장소를 모았어요 📍');
      } else { Object.assign(p, v); touch(r, p); toast('수정했어요'); }
      render();
    },
  });
  form.querySelectorAll('input[name=cat]').forEach((i) => i.addEventListener('change', () => {
    form.querySelectorAll('input[name=cat]').forEach((x) => x.parentElement.classList.toggle('on', x.checked));
  }));
  const doSearch = async () => {
    const q = form.q.value.trim(); if (!q) return;
    const box = $('.results', form); box.innerHTML = '<div class="faint" style="font-size:13px">검색 중…</div>';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=ko&q=${encodeURIComponent(q)}`);
      const js = await res.json();
      if (!js.length) { box.innerHTML = '<div class="faint" style="font-size:13px">검색 결과가 없어요. 이름·주소를 직접 입력해도 괜찮아요.</div>'; return; }
      box.innerHTML = js.map((x, i) => `<button type="button" data-i="${i}"><b>${esc(x.name || x.display_name.split(',')[0])}</b><br><span class="faint">${esc(x.display_name)}</span></button>`).join('');
      box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        const x = js[b.dataset.i];
        if (!form.name.value) form.name.value = x.name || x.display_name.split(',')[0];
        form.addr.value = x.display_name.split(',').slice(0, 4).reverse().map((s) => s.trim()).join(' ');
        form.lat.value = (+x.lat).toFixed(5); form.lng.value = (+x.lon).toFixed(5);
        $('.loc', form).textContent = '📍 위치 연결됨'; box.innerHTML = '';
      }));
    } catch (e) { box.innerHTML = '<div class="faint" style="font-size:13px">검색에 실패했어요. 직접 입력해 주세요.</div>'; }
  };
  $('[data-search]', form).addEventListener('click', doSearch);
  form.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
  $('[data-del]', form)?.addEventListener('click', () => {
    if (confirm(`'${p.name}'을(를) 삭제할까요?`)) { remove(r, 'places', p.id); closeModal(); render(); toast('삭제했어요'); }
  });
}

function initMap(r) {
  const el = $('#map'); if (!el || !window.L) return;
  const pts = r.places.filter((p) => p.lat);
  map = L.map(el, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  if (!pts.length) { map.setView([36.4, 127.8], 7); return; }
  const markers = pts.map((p) => {
    const day = p.day ? r.places.filter((x) => x.day === p.day).sort(sortPlan).indexOf(p) + 1 : 0;
    const color = p.day ? COLORS[(p.day - 1) % COLORS.length] : '#93a6a1';
    const icon = L.divIcon({ className: '', html: `<div class="pin" style="background:${color}"><span>${p.day ? day : cat(p.cat).e}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30] });
    return L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<b>${esc(p.name)}</b><br>${p.day ? p.day + '일차 · ' : ''}♥ ${p.hearts.length}<br><span style="color:#888">${esc(p.memo || '')}</span>`);
  });
  for (let d = 1; d <= dayCount(r); d++) {
    const line = r.places.filter((p) => p.day === d && p.lat).sort(sortPlan).map((p) => [p.lat, p.lng]);
    if (line.length > 1) L.polyline(line, { color: COLORS[(d - 1) % COLORS.length], weight: 3, dashArray: '6 6' }).addTo(map);
  }
  map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2), { maxZoom: 14 });
}

// ----- 일정 -----
const sortPlan = (a, b) => (a.time || '99') .localeCompare(b.time || '99') || (a.order || 0) - (b.order || 0);
function planTab(r) {
  const days = dayCount(r);
  const pending = r.places.filter((p) => !p.day);
  return `<div class="sec-head"><div><h2>우리 일정</h2><div class="muted">모아둔 곳을 날짜에 배치하고 순서·시간을 맞춰요.</div></div>
    <button class="btn" data-act="copy-plan">📋 단체톡에 붙여넣기용 복사</button></div>
  ${Array.from({ length: days }, (_, i) => {
    const d = i + 1, items = r.places.filter((p) => p.day === d).sort(sortPlan);
    const route = items.length > 1 ? routeUrl(items) : '';
    return `<section class="card day">
      <div class="day-head"><div class="row"><span class="pill" style="background:${COLORS[i % COLORS.length]};color:#fff">${d}일차</span><h3>${dayLabel(r, d)}</h3><span class="faint" style="font-size:13px">${items.length}곳</span></div>
        <div class="row" style="gap:6px">${route ? `<a class="btn sm" href="${route}" target="_blank" rel="noopener">🧭 경로 보기</a>` : ''}
        ${pending.length ? `<select data-change="assign" data-d="${d}" style="width:auto;padding:5px 10px;font-size:13px"><option value="">＋ 모아둔 곳에서 추가</option>${pending.map((p) => `<option value="${p.id}">${cat(p.cat).e} ${esc(p.name)} (♥${p.hearts.length})</option>`).join('')}</select>` : ''}</div></div>
      ${items.length ? `<ol class="tl">${items.map((p, j) => `<li>
        <span class="num" style="background:${COLORS[i % COLORS.length]}">${j + 1}</span>
        <input type="time" value="${p.time || ''}" data-change="time" data-id="${p.id}" aria-label="시간">
        <div class="grow"><b>${cat(p.cat).e} ${esc(p.name)}</b>${p.memo ? `<div class="faint" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.memo)}</div>` : ''}</div>
        <div class="ctrls"><button data-act="move" data-id="${p.id}" data-dir="-1" title="위로">▲</button><button data-act="move" data-id="${p.id}" data-dir="1" title="아래로">▼</button><button data-act="set-day" data-id="${p.id}" data-d="0" title="일정에서 빼기">✕</button></div>
      </li>`).join('')}</ol>` : `<div class="faint" style="padding:10px 0;font-size:14px">아직 비어 있어요. 모아둔 곳에서 골라 넣어보세요.</div>`}
    </section>`;
  }).join('')}
  ${pending.length ? `<div class="sec-head"><h2>아직 날짜 미정 <span class="pill warm">${pending.length}</span></h2></div>
  <div class="card" style="padding:6px 16px">${pending.sort((a, b) => b.hearts.length - a.hearts.length).map((p) => `<div class="check" style="flex-wrap:wrap"><span>${cat(p.cat).e}</span><b class="grow">${esc(p.name)}</b><span class="faint" style="font-size:13px">♥ ${p.hearts.length}</span>
    <div class="day-pick">${Array.from({ length: days }, (_, i) => `<button data-act="set-day" data-id="${p.id}" data-d="${i + 1}">${i + 1}일차</button>`).join('')}</div></div>`).join('')}</div>` : ''}`;
}
function routeUrl(items) {
  const loc = (p) => (p.lat ? `${p.lat},${p.lng}` : `${p.name} ${p.addr || ''}`.trim());
  const o = loc(items[0]), d = loc(items[items.length - 1]);
  const w = items.slice(1, -1).map(loc).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}${w ? '&waypoints=' + encodeURIComponent(w) : ''}`;
}
function planText(r) {
  let t = `✈️ ${r.name}\n📍 ${r.dest} · ${range(r)}\n`;
  for (let d = 1; d <= dayCount(r); d++) {
    const items = r.places.filter((p) => p.day === d).sort(sortPlan);
    t += `\n[${d}일차 · ${dayLabel(r, d)}]\n` + (items.map((p, i) => `${i + 1}. ${p.time ? p.time + ' ' : ''}${p.name}`).join('\n') || '- 미정');
  }
  const pend = r.places.filter((p) => !p.day);
  if (pend.length) t += `\n\n💭 후보: ${pend.map((p) => p.name).join(', ')}`;
  return t + '\n\n— 모아여행에서 함께 만든 일정';
}

// ----- 정산 -----
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
    if (debt[i][1] < 0.5) i++; if (cred[j][1] < 0.5) j++;
  }
  return { bal, tx };
}
function moneyTab(r) {
  const total = r.expenses.reduce((s, e) => s + e.amount, 0);
  const { bal, tx } = settle(r);
  const me = meId(r);
  const mine = r.expenses.reduce((s, e) => s + (e.split.includes(me) ? e.amount / e.split.length : 0), 0);
  const byCat = ECATS.map((c) => [c, r.expenses.filter((e) => e.cat === c.k).reduce((s, e) => s + e.amount, 0)]).filter((x) => x[1]);
  return `<div class="sec-head"><div><h2>함께 쓴 돈</h2><div class="muted">누가 냈는지만 적으면, 누가 누구에게 얼마 보낼지 계산해 드려요.</div></div>
    <button class="btn pri" data-act="add-exp">＋ 지출 추가</button></div>
  <div class="stats">
    <div class="card stat"><div class="muted" style="font-size:13px">총 지출</div><div class="v">${won(total)}</div></div>
    <div class="card stat"><div class="muted" style="font-size:13px">1인 평균</div><div class="v">${won(total / Math.max(1, r.members.length))}</div></div>
    <div class="card stat"><div class="muted" style="font-size:13px">내 부담</div><div class="v">${won(mine)}</div></div>
  </div>
  ${byCat.length ? `<div class="card" style="padding:16px;margin-top:12px"><div class="row" style="height:12px;border-radius:99px;overflow:hidden;gap:0;flex-wrap:nowrap">${byCat.map(([c, v], i) => `<span title="${c.n} ${won(v)}" style="height:100%;width:${(v / total) * 100}%;background:${COLORS[i]}"></span>`).join('')}</div>
    <div class="row" style="margin-top:10px;font-size:13px">${byCat.map(([c, v], i) => `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COLORS[i]}"></span> ${c.e} ${c.n} <b>${won(v)}</b></span>`).join('')}</div></div>` : ''}
  <div class="sec-head"><h2>이렇게 보내면 끝 💸</h2>${tx.length ? '<button class="btn sm" data-act="copy-settle">📋 정산 결과 복사</button>' : ''}</div>
  ${tx.length ? tx.map((t) => `<div class="transfer">${av(member(r, t.from))}<b>${esc(member(r, t.from).name)}</b><span class="faint">→</span>${av(member(r, t.to))}<b class="grow">${esc(member(r, t.to).name)}</b><b>${won(t.amt)}</b></div>`).join('')
    : `<div class="card empty" style="padding:24px">${r.expenses.length ? '모두 정산 완료! 🎉' : '아직 기록된 지출이 없어요.'}</div>`}
  <div class="sec-head"><h2>사람별</h2></div>
  <div class="card" style="padding:4px 12px;overflow-x:auto"><table class="t"><thead><tr><th>이름</th><th class="num-r">낸 돈</th><th class="num-r">쓴 몫</th><th class="num-r">차액</th></tr></thead><tbody>
    ${r.members.map((m) => { const paid = r.expenses.filter((e) => e.payer === m.id).reduce((s, e) => s + e.amount, 0); const b = bal[m.id] || 0;
      return `<tr><td><div class="row" style="gap:6px">${av(m, 22)}${esc(m.name)}</div></td><td class="num-r">${won(paid)}</td><td class="num-r">${won(paid - b)}</td><td class="num-r ${b > 0.5 ? 'pos' : b < -0.5 ? 'neg' : ''}">${b > 0.5 ? '+' : ''}${won(b)}</td></tr>`; }).join('')}
  </tbody></table></div>
  <div class="sec-head"><h2>지출 내역 <span class="pill">${r.expenses.length}</span></h2></div>
  <div class="card" style="padding:4px 12px;overflow-x:auto"><table class="t"><tbody>
    ${r.expenses.slice().sort((a, b) => b.at - a.at).map((e) => `<tr style="cursor:pointer" data-act="edit-exp" data-id="${e.id}"><td style="width:32px">${ecat(e.cat).e}</td><td><b>${esc(e.title)}</b><div class="faint" style="font-size:12px">${esc(member(r, e.payer).name)}님 결제 · ${e.split.length}명 나눔</div></td><td class="num-r"><b>${won(e.amount)}</b><div class="faint" style="font-size:12px">1인 ${won(e.amount / Math.max(1, e.split.length))}</div></td></tr>`).join('') || '<tr><td class="faint" style="text-align:center;padding:24px">항공권, 숙소처럼 미리 낸 돈부터 적어보세요.</td></tr>'}
  </tbody></table></div>`;
}
function expModal(r, e) {
  const isNew = !e;
  e = e || { title: '', amount: '', cat: 'food', payer: meId(r), split: r.members.map((m) => m.id) };
  const form = openModal({
    title: isNew ? '지출 추가' : '지출 수정',
    body: `<label class="f">무엇에 썼나요? <input type="text" name="title" required maxlength="60" value="${esc(e.title)}" placeholder="예: 흑돼지 저녁"></label>
      <label class="f">금액 (원) <input type="number" name="amount" required min="1" step="1" inputmode="numeric" value="${e.amount}"></label>
      <div class="chips">${ECATS.map((c) => `<label class="chip ${e.cat === c.k ? 'on' : ''}" style="cursor:pointer"><input type="radio" name="cat" value="${c.k}" ${e.cat === c.k ? 'checked' : ''} hidden>${c.e} ${c.n}</label>`).join('')}</div>
      <label class="f">누가 냈나요? <select name="payer">${r.members.map((m) => `<option value="${m.id}" ${e.payer === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      <div class="f" style="font-size:13px;font-weight:700;color:var(--muted)">누구와 나누나요?<div class="chips" style="margin-top:6px">${r.members.map((m) => `<label class="chip ${e.split.includes(m.id) ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" name="split" value="${m.id}" ${e.split.includes(m.id) ? 'checked' : ''} hidden>${esc(m.name)}</label>`).join('')}</div></div>
      ${isNew ? '' : '<button type="button" class="btn sm danger" data-del style="align-self:flex-start">이 지출 삭제</button>'}`,
    onOk(f) {
      const fd = new FormData(f), split = fd.getAll('split');
      if (!split.length) { toast('나눌 사람을 한 명 이상 골라주세요'); return false; }
      const v = { title: fd.get('title').trim(), amount: Math.abs(+fd.get('amount')), cat: fd.get('cat'), payer: fd.get('payer'), split };
      if (isNew) { const ne = { id: uid(), ...v, at: now() }; r.expenses.push(ne); touch(r, ne); } else { Object.assign(e, v); touch(r, e); }
      toast('기록했어요 💰'); render();
    },
  });
  form.querySelectorAll('input[type=radio],input[type=checkbox]').forEach((i) => i.addEventListener('change', () => {
    form.querySelectorAll('input[type=radio],input[type=checkbox]').forEach((x) => x.parentElement.classList.toggle('on', x.checked));
  }));
  $('[data-del]', form)?.addEventListener('click', () => { if (confirm('이 지출을 삭제할까요?')) { remove(r, 'expenses', e.id); closeModal(); render(); } });
}

// ----- 준비물 -----
function packTab(r) {
  const me = meId(r);
  let list = r.checklist.slice();
  if (ui.packFilter === 'me') list = list.filter((c) => c.who === me);
  if (ui.packFilter === 'common') list = list.filter((c) => !c.who);
  list.sort((a, b) => a.done - b.done);
  const done = r.checklist.filter((c) => c.done).length, all = r.checklist.length;
  return `<div class="sec-head"><div><h2>준비물 체크리스트</h2><div class="muted">누가 뭘 챙길지 정해두면 겹치지 않아요.</div></div>
    ${r.checklist.length < 3 ? '<button class="btn" data-act="pack-template">✨ 기본 준비물 넣기</button>' : ''}</div>
  <div class="card" style="padding:16px">
    <div class="row between" style="margin-bottom:8px"><b>${done} / ${all} 준비 완료</b><span class="faint">${all ? Math.round((done / all) * 100) : 0}%</span></div>
    <div class="progress"><i style="width:${all ? (done / all) * 100 : 0}%"></i></div>
    <form class="row" data-form="pack" style="margin-top:14px;flex-wrap:nowrap"><input type="text" name="t" placeholder="챙길 것 추가" maxlength="60" style="flex:1"><select name="who" style="width:auto"><option value="">공용</option>${r.members.map((m) => `<option value="${m.id}" ${m.id === me ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select><button class="btn pri">추가</button></form>
  </div>
  <div class="chips" style="margin:14px 0">${[['all', '전체'], ['me', '내가 챙길 것'], ['common', '공용']].map(([k, n]) => `<button class="chip ${ui.packFilter === k ? 'on' : ''}" data-act="pack-filter" data-k="${k}">${n}</button>`).join('')}</div>
  <div class="card" style="padding:4px 4px">${list.map((c) => `<div class="check ${c.done ? 'done' : ''}"><input type="checkbox" ${c.done ? 'checked' : ''} data-act="pack-toggle" data-id="${c.id}" aria-label="완료"><span class="t grow">${esc(c.text)}</span>${c.who ? `<span class="row" style="gap:4px;font-size:12px">${av(member(r, c.who), 20)}${esc(member(r, c.who).name)}</span>` : '<span class="pill">공용</span>'}<button class="btn sm ghost" data-act="pack-del" data-id="${c.id}">✕</button></div>`).join('') || '<div class="empty">비어 있어요</div>'}</div>`;
}

// ----- 기록 -----
function journalTab(r) {
  const list = r.journal.slice().sort((a, b) => a.day - b.day || a.upd - b.upd);
  return `<div class="sec-head"><div><h2>여행 기록</h2><div class="muted">그날의 기분과 사진을 남겨요. 사진은 내 기기에만 저장돼요.</div></div>
    <button class="btn pri" data-act="add-entry">＋ 기록 남기기</button></div>
  ${list.length ? list.map((j) => { const w = member(r, j.by); return `<article class="card entry" style="margin-bottom:12px">
    <div class="row between"><div class="row"><span class="mood">${j.mood}</span><div><b>${j.day}일차 · ${dayLabel(r, j.day)}</b><div class="row faint" style="gap:4px;font-size:12px">${av(w, 18)}${esc(w.name)}</div></div></div>
    ${j.by === meId(r) ? `<button class="btn sm ghost" data-act="del-entry" data-id="${j.id}">삭제</button>` : ''}</div>
    <p style="white-space:pre-wrap;margin:10px 0 0">${esc(j.text)}</p>
    ${j.photos?.length ? `<div class="photos">${j.photos.map((src) => `<img src="${src}" alt="여행 사진" data-act="photo">`).join('')}</div>` : ''}
  </article>`; }).join('') : `<div class="card empty"><div class="big">📸</div>여행이 시작되면 하루하루를 기록해보세요.</div>`}`;
}
function entryModal(r) {
  const form = openModal({
    title: '오늘의 기록',
    body: `<label class="f">날짜 <select name="day">${Array.from({ length: dayCount(r) }, (_, i) => `<option value="${i + 1}">${i + 1}일차 · ${dayLabel(r, i + 1)}</option>`).join('')}</select></label>
      <div class="chips">${MOODS.map((m, i) => `<label class="chip ${i === 0 ? 'on' : ''}" style="cursor:pointer;font-size:20px"><input type="radio" name="mood" value="${m}" ${i === 0 ? 'checked' : ''} hidden>${m}</label>`).join('')}</div>
      <label class="f">어땠나요? <textarea name="text" required maxlength="1000" placeholder="오늘 가장 좋았던 순간은?"></textarea></label>
      <label class="f">사진 (최대 4장) <input type="file" name="photos" accept="image/*" multiple></label>`,
    ok: '남기기',
    onOk(f) {
      const fd = new FormData(f);
      const files = fd.getAll('photos').filter((x) => x.size).slice(0, 4);
      Promise.all(files.map(shrink)).then((photos) => {
        const j = { id: uid(), day: +fd.get('day'), mood: fd.get('mood'), text: fd.get('text').trim(), photos, by: meId(r) };
        r.journal.push(j); touch(r, j); render(); toast('기록했어요 📸');
      });
    },
  });
  form.querySelectorAll('input[name=mood]').forEach((i) => i.addEventListener('change', () => form.querySelectorAll('input[name=mood]').forEach((x) => x.parentElement.classList.toggle('on', x.checked))));
}
function shrink(file) {
  return new Promise((res) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 720 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => res(null);
    img.src = url;
  }).then((x) => x || '');
}

// ----- 여행방 설정 -----
function settingsTab(r) {
  return `<div class="sec-head"><div><h2>여행방</h2><div class="muted">기본 정보와 일행을 관리해요.</div></div></div>
  <form class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px" data-form="room">
    <label class="f">여행 이름 <input type="text" name="name" required maxlength="40" value="${esc(r.name)}"></label>
    <div class="grid2"><label class="f">여행지 <input type="text" name="dest" maxlength="30" value="${esc(r.dest)}"></label>
    <div class="f" style="font-size:13px;font-weight:700;color:var(--muted)">아이콘<div class="chips" style="margin-top:6px">${EMOJIS.map((e) => `<label class="chip ${r.emoji === e ? 'on' : ''}" style="cursor:pointer;font-size:18px;padding:3px 8px"><input type="radio" name="emoji" value="${e}" ${r.emoji === e ? 'checked' : ''} hidden>${e}</label>`).join('')}</div></div></div>
    <div class="grid2"><label class="f">출발 <input type="date" name="start" required value="${r.start}"></label><label class="f">도착 <input type="date" name="end" required value="${r.end}"></label></div>
    <div><button class="btn pri">저장</button></div>
  </form>
  <div class="sec-head"><h2>일행 <span class="pill">${r.members.length}</span></h2></div>
  <div class="card" style="padding:4px 4px">${r.members.map((m) => `<div class="check">${av(m)}<b class="grow">${esc(m.name)}${m.id === meId(r) ? ' <span class="pill">나</span>' : ''}</b><button class="btn sm ghost" data-act="rename-mem" data-id="${m.id}">이름 변경</button>${r.members.length > 1 ? `<button class="btn sm ghost danger" data-act="del-mem" data-id="${m.id}">내보내기</button>` : ''}</div>`).join('')}
    <form class="row" data-form="member" style="padding:10px 12px;flex-wrap:nowrap"><input type="text" name="t" placeholder="일행 이름 추가" maxlength="12" style="flex:1"><button class="btn">추가</button></form></div>
  <div class="sec-head"><h2>공유 · 백업</h2></div>
  <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:10px">
    <div class="muted" style="font-size:14px">모아여행은 서버 없이 동작해요. <b>공유 링크</b>에 여행방 전체가 담겨 있어서, 친구가 링크를 열면 내 내용과 자동으로 합쳐져요. 수정한 뒤에는 새 링크를 다시 보내주세요.</div>
    <div class="row"><button class="btn pri" data-act="share">🔗 공유 링크 만들기</button><button class="btn" data-act="export">💾 파일로 내보내기</button><button class="btn" data-act="import">📥 가져오기</button></div>
  </div>
  <div class="sec-head"><h2 style="color:var(--danger)">위험 구역</h2></div>
  <div class="card" style="padding:18px"><button class="btn danger" data-act="del-room">이 여행방 지우기 (내 기기에서)</button></div>`;
}

// ---------- 공통 모달 ----------
function roomModal() {
  const s = isoDate(addDays(isoDate(new Date()), 14));
  const form = openModal({
    title: '새 여행 만들기',
    body: `<label class="f">여행 이름 <input type="text" name="name" required maxlength="40" placeholder="예: 우리의 느긋한 제주"></label>
      <label class="f">어디로 가나요? <input type="text" name="dest" required maxlength="30" placeholder="예: 제주, 오사카, 강릉"></label>
      <div class="chips">${EMOJIS.map((e, i) => `<label class="chip ${i === 0 ? 'on' : ''}" style="cursor:pointer;font-size:18px;padding:3px 8px"><input type="radio" name="emoji" value="${e}" ${i === 0 ? 'checked' : ''} hidden>${e}</label>`).join('')}</div>
      <div class="grid2"><label class="f">출발 <input type="date" name="start" required value="${s}"></label><label class="f">도착 <input type="date" name="end" required value="${isoDate(addDays(s, 2))}"></label></div>
      <label class="f">내 이름 <input type="text" name="me" required maxlength="12" placeholder="친구들이 부르는 이름"></label>
      <label class="f">함께 가는 사람 <span class="faint" style="font-weight:400">— 쉼표로 구분, 나중에 추가해도 돼요</span><input type="text" name="others" placeholder="유진, 민수, 지우"></label>`,
    ok: '여행방 만들기',
    onOk(f) {
      const d = Object.fromEntries(new FormData(f));
      if (d.end < d.start) { toast('도착일이 출발일보다 빨라요'); return false; }
      const others = d.others.split(/[,，、\n]/).map((x) => x.trim()).filter(Boolean);
      const r = newRoom({ name: d.name.trim(), dest: d.dest.trim(), emoji: d.emoji, start: d.start, end: d.end, members: [d.me.trim(), ...others] });
      sysMsg(r, `${d.me.trim()}님이 여행방을 만들었어요 🎉`);
      S.rooms[r.id] = r; S.me[r.id] = r.members[0].id; save();
      go(`#/r/${r.id}/places`); setTimeout(() => shareModal(r, true), 200);
    },
  });
  form.querySelectorAll('input[name=emoji]').forEach((i) => i.addEventListener('change', () => form.querySelectorAll('input[name=emoji]').forEach((x) => x.parentElement.classList.toggle('on', x.checked))));
}
function pickMe(r) {
  if ($('#modal-root').innerHTML) return;
  const form = openModal({
    title: `${r.emoji} ${esc(r.name)}`,
    body: `<div class="muted">이 여행방에서 나는 누구인가요? 하트와 의견이 이 이름으로 남아요.</div>
      <div class="chips">${r.members.map((m) => `<button type="button" class="chip" data-m="${m.id}" style="font-size:15px;padding:8px 14px">${av(m, 22)} ${esc(m.name)}</button>`).join('')}</div>
      <label class="f">목록에 없다면 <div class="row" style="flex-wrap:nowrap"><input type="text" name="n" placeholder="내 이름" maxlength="12" style="flex:1"><button class="btn pri">참여하기</button></div></label>`,
    onOk: null,
  });
  form.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { S.me[r.id] = b.dataset.m; save(); closeModal(); render(); }));
  form.addEventListener('submit', () => {
    const n = form.n.value.trim(); if (!n) return;
    const m = { id: uid(), name: n, color: COLORS[r.members.length % COLORS.length], upd: now() };
    r.members.push(m); S.me[r.id] = m.id; sysMsg(r, `${n}님이 들어왔어요 👋`); touch(r, m); closeModal(); render();
  });
}
async function shareModal(r, fresh) {
  const link = await shareLink(r);
  const form = openModal({
    title: fresh ? '여행방이 만들어졌어요 🎉' : '일행 초대 · 최신 내용 공유',
    body: `<div class="muted" style="font-size:14px">이 링크를 단체톡에 보내세요. 링크에 지금까지의 장소·일정·정산이 모두 담겨 있어요. 친구가 내용을 추가하면 <b>그 친구의 새 링크</b>를 받아 열면 자동으로 합쳐져요.</div>
      <textarea readonly style="font-size:12px;min-height:70px">${esc(link)}</textarea>
      <div class="faint" style="font-size:12px">링크 길이 ${link.length.toLocaleString()}자 ${link.length > 6000 ? '· 길어서 일부 메신저에서 잘릴 수 있어요. 그럴 땐 파일로 내보내기를 써주세요.' : ''}</div>
      <div class="row"><button type="button" class="btn pri" data-copy>🔗 링크 복사</button>${navigator.share ? '<button type="button" class="btn" data-native>📤 공유하기</button>' : ''}<button type="button" class="btn" data-plan>📋 일정 텍스트 복사</button></div>`,
    onOk: null,
  });
  $('[data-copy]', form).addEventListener('click', () => copy(`[모아여행] ${r.name} 같이 계획해요!\n${link}`, '링크를 복사했어요. 단체톡에 붙여넣어 주세요!'));
  $('[data-native]', form)?.addEventListener('click', () => navigator.share({ title: r.name, text: `[모아여행] ${r.name} 같이 계획해요!`, url: link }).catch(() => {}));
  $('[data-plan]', form).addEventListener('click', () => copy(planText(r), '일정을 복사했어요'));
}
function importModal() {
  const form = openModal({
    title: '여행방 가져오기',
    body: `<label class="f">친구가 보낸 공유 링크 <textarea name="link" placeholder="https://…#join=…"></textarea></label>
      <label class="f">또는 내보낸 파일 (.json) <input type="file" name="file" accept=".json,application/json"></label>`,
    ok: '가져오기',
    onOk(f) {
      const file = f.file.files[0], link = f.link.value.trim();
      if (file) {
        file.text().then((t) => {
          try { const inc = JSON.parse(t); if (!inc.id || !inc.members) throw 0; S.rooms[inc.id] = S.rooms[inc.id] ? mergeRoom(S.rooms[inc.id], inc) : inc; save(); toast('가져왔어요'); go(`#/r/${inc.id}/places`); }
          catch (e) { toast('모아여행 파일이 아니에요'); }
        });
      } else if (link.includes('#join=')) { location.hash = 'join=' + link.split('#join=')[1]; }
      else { toast('링크나 파일을 넣어주세요'); return false; }
    },
  });
}

// ---------- 이벤트 ----------
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, r = route().page === 'room' ? room() : null;
  const P = (id) => r.places.find((p) => p.id === id);
  const acts = {
    home: () => go('#/'),
    open: () => go(`#/r/${el.dataset.id}/places`),
    tab: () => go(`#/r/${r.id}/${el.dataset.k}`),
    'new-room': roomModal,
    import: importModal,
    theme: () => { S.theme = { auto: 'dark', dark: 'light', light: 'auto' }[S.theme] || 'auto'; save(); applyTheme(); render(); toast({ auto: '기기 설정 테마', dark: '어두운 테마', light: '밝은 테마' }[S.theme]); },
    share: () => shareModal(r),
    'pick-me': () => pickMe(r),
    'fork-demo': () => { const c = JSON.parse(JSON.stringify(r)); c.id = uid(); delete c.demo; c.name = r.name + ' (내 방)'; c.updatedAt = now(); S.rooms[c.id] = c; S.me[c.id] = S.me.demo; save(); go(`#/r/${c.id}/places`); toast('내 여행방으로 복사했어요'); },
    'reset-demo': () => { S.rooms.demo = demoRoom(); S.me.demo = S.rooms.demo.members[0].id; save(); render(); toast('처음 상태로 돌렸어요'); },
    filter: () => { ui.filter = el.dataset.k; render(); },
    view: () => { ui.view = el.dataset.k; render(); },
    'add-place': () => placeModal(r),
    'edit-place': () => placeModal(r, P(el.dataset.id)),
    heart: () => { const p = P(el.dataset.id), me = meId(r); p.hearts = p.hearts.includes(me) ? p.hearts.filter((h) => h !== me) : [...p.hearts, me]; touch(r, p); render(); },
    cmt: () => { ui.openCmt[el.dataset.id] = !ui.openCmt[el.dataset.id]; render(); },
    'del-cmt': () => { const p = P(el.dataset.id); p.comments = p.comments.filter((c) => c.id !== el.dataset.c); touch(r, p); render(); },
    'set-day': () => { const p = P(el.dataset.id), d = +el.dataset.d || null; p.day = d; p.order = d ? r.places.filter((x) => x.day === d).length : 0; touch(r, p); render(); if (d) toast(`${d}일차에 넣었어요`); },
    move: () => {
      const p = P(el.dataset.id), items = r.places.filter((x) => x.day === p.day).sort(sortPlan), i = items.indexOf(p), j = i + +el.dataset.dir;
      if (j < 0 || j >= items.length) return;
      if (items[i].time && items[j].time) { [items[i].time, items[j].time] = [items[j].time, items[i].time]; }
      [items[i], items[j]] = [items[j], items[i]]; items.forEach((x, k) => { x.order = k; x.upd = now(); }); touch(r); render();
    },
    'copy-plan': () => copy(planText(r), '일정을 복사했어요. 단체톡에 붙여넣어 보세요!'),
    'add-exp': () => expModal(r),
    'edit-exp': () => expModal(r, r.expenses.find((e) => e.id === el.dataset.id)),
    'copy-settle': () => { const { tx } = settle(r); copy(`💸 ${r.name} 정산\n총 ${won(r.expenses.reduce((s, e) => s + e.amount, 0))}\n\n` + tx.map((t) => `${member(r, t.from).name} → ${member(r, t.to).name} ${won(t.amt)}`).join('\n'), '정산 결과를 복사했어요'); },
    'pack-template': () => { PACK_TEMPLATE.forEach((t) => { if (!r.checklist.some((c) => c.text === t)) r.checklist.push({ id: uid(), text: t, who: null, done: false, upd: now() }); }); touch(r); render(); },
    'pack-filter': () => { ui.packFilter = el.dataset.k; render(); },
    'pack-toggle': () => { const c = r.checklist.find((x) => x.id === el.dataset.id); c.done = !c.done; touch(r, c); render(); },
    'pack-del': () => { remove(r, 'checklist', el.dataset.id); render(); },
    'add-entry': () => entryModal(r),
    'del-entry': () => { if (confirm('이 기록을 삭제할까요?')) { remove(r, 'journal', el.dataset.id); render(); } },
    photo: () => openModal({ title: '사진', body: `<img src="${el.src}" style="width:100%;border-radius:12px" alt="여행 사진">` }),
    'rename-mem': () => { const m = member(r, el.dataset.id), n = prompt('새 이름', m.name); if (n && n.trim()) { m.name = n.trim().slice(0, 12); touch(r, m); render(); } },
    'del-mem': () => { const m = member(r, el.dataset.id); if (confirm(`${m.name}님을 일행에서 뺄까요? 정산에서도 빠져요.`)) { remove(r, 'members', m.id); if (S.me[r.id] === m.id) delete S.me[r.id]; save(); render(); } },
    export: () => { const blob = new Blob([JSON.stringify(r, null, 1)], { type: 'application/json' }); const a2 = document.createElement('a'); a2.href = URL.createObjectURL(blob); a2.download = `모아여행-${r.name}.json`; a2.click(); },
    'del-room': () => { if (confirm(`'${r.name}'을(를) 이 기기에서 지울까요? 공유 링크나 파일이 없으면 되돌릴 수 없어요.`)) { delete S.rooms[r.id]; delete S.me[r.id]; save(); go('#/'); } },
  };
  acts[a]?.();
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('[data-form]'); if (!f) return;
  ev.preventDefault();
  const r = room(), t = f.t?.value.trim();
  const kind = f.dataset.form;
  if (kind === 'chat' && t) { r.messages.push({ id: uid(), by: meId(r), text: t, at: now(), upd: now() }); touch(r); render(); $('.composer input')?.focus(); }
  if (kind === 'cmt' && t) { const p = r.places.find((x) => x.id === f.dataset.id); p.comments.push({ id: uid(), by: meId(r), text: t, at: now() }); touch(r, p); render(); }
  if (kind === 'pack' && t) { const c = { id: uid(), text: t, who: f.who.value || null, done: false }; r.checklist.push(c); touch(r, c); render(); $('[data-form=pack] input')?.focus(); }
  if (kind === 'member' && t) { const m = { id: uid(), name: t.slice(0, 12), color: COLORS[r.members.length % COLORS.length] }; r.members.push(m); sysMsg(r, `${t}님이 일행에 추가됐어요`); touch(r, m); render(); }
  if (kind === 'room') {
    const d = Object.fromEntries(new FormData(f));
    if (d.end < d.start) return toast('도착일이 출발일보다 빨라요');
    Object.assign(r, { name: d.name.trim(), dest: d.dest.trim(), emoji: d.emoji || r.emoji, start: d.start, end: d.end });
    const n = dayCount(r); r.places.forEach((p) => { if (p.day > n) p.day = null; });
    touch(r); render(); toast('저장했어요');
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.closest('[data-form=room]') && el.name === 'emoji') { el.closest('.chips').querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked)); return; }
  const k = el.dataset.change; if (!k) return;
  const r = room();
  if (k === 'sort') { ui.sort = el.value; render(); }
  if (k === 'assign' && el.value) { const p = r.places.find((x) => x.id === el.value); p.day = +el.dataset.d; p.order = r.places.filter((x) => x.day === p.day).length; touch(r, p); render(); }
  if (k === 'time') { const p = r.places.find((x) => x.id === el.dataset.id); p.time = el.value; touch(r, p); render(); }
});

// ---------- 시작 ----------
applyTheme();
if (location.hash.startsWith('#join=')) checkJoin(); else render();
