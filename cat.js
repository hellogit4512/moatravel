/* 모아여행 프로필 고양이: 앱 로고 고양이 선 그대로 + 털 무늬 · 표정 · 소품을 골라 꾸며요
 * 설정 값(m.cat): { c: 털 무늬, p: 무늬 색, t: 배경, e: 표정, g: 얼굴 소품, h: 머리, n: 목, d: 모험 도구 } — 모두 번호
 */
const CAT_LOGO = 'M22.7 27.6 L31.2 9.6 L38.2 17.5 L44.1 8.9 L52.2 38 C53.6 44 53 50 48 52 C42 53.6 22 53.6 16 52.4 C10.8 51 9.8 46.6 10.2 41 C10.4 37.4 11 33.6 12 29.4';
const CAT_FILL = CAT_LOGO + ' L22.7 27.6 Z';
const CAT_TILES = ['#0fa37a', '#ff6a47', '#3b82f6', '#f2a100', '#8b5cf6', '#1f2a26', '#9fd8c4', '#ffc2cf', '#bcd7ff', '#ffe08a', '#d9c8ff', '#e9e3d9'];
const CAT_PAT = [['까망', '#2b2f36'], ['하늘', '#8ec9f0'], ['회색', '#8a939f'], ['치즈', '#f08c2e'], ['초코', '#5e3d2a'], ['분홍', '#ff9fb4']];
const CAT_PARTS = (() => {
  const C = { cream: '#fff3dc', cheese: '#ffbf66', cheeseD: '#f08c2e', gray: '#c3c9d2', grayD: '#7d8794', black: '#2b2f36', white: '#ffffff', pink: '#ffc8d4', choco: '#9b6b4f', chocoD: '#5e3d2a', mint: '#bfeee0' };
  const R = (c) => `<rect width="64" height="64" fill="${c}"/>`;
  const E = (cx, cy, rx, ry, c, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const stripes = (c) => [18, 25, 32, 39, 46].map((y, i) => `<path d="M8 ${y + 4}Q${30 + (i % 2) * 4} ${y - 3} 56 ${y + 2}" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join('');
  // 털 무늬: [이름, 그림(문자열 또는 무늬 색을 받는 함수), 얼굴이 어두운지(무늬 색 번호로 판단할 때는 함수)]
  const coat = [
    ['로고 그대로', '', 'tile'],
    ['크림', R(C.cream)], ['치즈', R(C.cheese)], ['회색', R(C.gray)], ['까망', R(C.black), true], ['분홍', R(C.pink)], ['민트', R(C.mint)],
    ['치즈 태비', R(C.cheese) + stripes(C.cheeseD)], ['고등어 태비', R(C.gray) + stripes(C.grayD)],
    ['삼색이', R(C.white) + E(24, 24, 9, 7, C.cheese, -20) + E(44, 40, 8, 6, C.black, 15) + E(20, 46, 6, 4.5, C.black) + E(42, 20, 5, 4, C.cheese)],
    ['젖소', (pc) => R(C.white) + E(28, 22, 6, 5, pc, 20) + E(44, 42, 7, 5, pc) + E(18, 44, 4.5, 3.5, pc) + E(41, 14, 3, 2.6, pc)],
    ['턱시도', (pc) => R(pc) + `<path d="M24 54Q22 36 32 30Q44 34 46 54z" fill="${C.white}"/>`, (p) => [0, 2, 4].includes(p)],
    ['하치와레', (pc) => R(C.white) + `<path d="M0 0H64V31.5H49.5L38 17.4L26.5 31.5H0z" fill="${pc}"/>`],
    ['카오스', R(C.black) + E(22, 30, 7, 5, C.cheeseD, 30) + E(42, 22, 5, 4, C.cheeseD) + E(36, 44, 7, 4, C.cheese, -10) + E(16, 46, 4, 3, C.cheese), true],
    ['샴 포인트', R(C.cream) + `<path d="M24 26L31 9L38 17L44 9L48 24Q36 20 24 26z" fill="${C.chocoD}"/>` + E(52, 48, 7, 9, C.chocoD)],
    ['초코', R(C.choco), true],
  ];
  // 표정 (눈은 31.6 / 44.4, 입은 38 근처). {k}는 잉크 색으로 바뀌어요
  const eyes = (r = 2.1) => `<circle cx="31.6" cy="28.4" r="${r}" fill="{k}"/><circle cx="44.4" cy="28.4" r="${r}" fill="{k}"/>`;
  const shine = '<circle cx="32.3" cy="27.6" r=".7" fill="#fff"/><circle cx="45.1" cy="27.6" r=".7" fill="#fff"/>';
  const w = '<path d="M36.4 32q.8.9 1.6 0q.8.9 1.6 0" stroke="{k}" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  const arcs = '<path d="M29.4 29q2.2-2.8 4.4 0M42.2 29q2.2-2.8 4.4 0" stroke="{k}" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  const sad = '<path d="M36.4 33.4q1.6-1.6 3.2 0" stroke="{k}" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  const blush = '<ellipse cx="28.4" cy="32.6" rx="2.8" ry="1.6" fill="#ff8a9a" opacity=".7"/><ellipse cx="47.6" cy="32.6" rx="2.8" ry="1.6" fill="#ff8a9a" opacity=".7"/>';
  const sparkle = (x) => `<path d="M${x} 25.4l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="{k}"/>`;
  const heart = (x) => `<path d="M${x} 30.4l-2.6-2.4a1.6 1.6 0 0 1 2.6-2 1.6 1.6 0 0 1 2.6 2z" fill="#ff4f6d"/>`;
  const face = [
    ['없음', ''],
    ['동글', eyes() + shine + w],
    ['방긋', arcs + '<path d="M36.6 31.6q1.4 2 2.8 0z" fill="{k}"/>'],
    ['윙크', '<circle cx="31.6" cy="28.4" r="2.1" fill="{k}"/><path d="M42.2 29q2.2-2.8 4.4 0" stroke="{k}" stroke-width="1.8" fill="none" stroke-linecap="round"/>' + w],
    ['졸림', '<path d="M29.6 28.6h4M42.4 28.6h4" stroke="{k}" stroke-width="1.6" stroke-linecap="round"/><path d="M37 32.4h2" stroke="{k}" stroke-width="1.3" stroke-linecap="round"/><text x="47" y="21" font-size="5.4" font-weight="800" fill="{k}" font-family="sans-serif">z</text>'],
    ['하트 눈', heart(31.6) + heart(44.4) + w],
    ['반짝 눈', sparkle(31.6) + sparkle(44.4) + w],
    ['울먹', eyes(2.3) + shine + '<path d="M45.2 31.4q1.7 2.5 0 3.6q-1.7-1.1 0-3.6z" fill="#8ec9f0"/>' + sad],
    ['놀람', eyes(1.7) + '<ellipse cx="38" cy="33" rx="1.3" ry="1.7" fill="{k}"/>'],
    ['메롱', eyes() + '<path d="M36 32.2h4" stroke="{k}" stroke-width="1.3" stroke-linecap="round"/><path d="M37.4 32.3v1.6a1.2 1.2 0 0 0 2.4 0v-1.6z" fill="#ff7a8a"/>'],
    ['뿌듯', '<path d="M29.8 27l3.2 1.6-3.2 1.6M46.2 27l-3.2 1.6 3.2 1.6" stroke="{k}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M36.4 31.6q1.6 2.2 3.2 0z" fill="{k}"/>'],
    ['화남', '<path d="M29.2 25.2l4.2 1.6M46.8 25.2l-4.2 1.6" stroke="{k}" stroke-width="1.5" stroke-linecap="round"/>' + eyes(1.8) + sad],
    ['멍', eyes(1.2) + '<path d="M36.8 32.4h2.4" stroke="{k}" stroke-width="1.3" stroke-linecap="round"/>'],
    ['군침', eyes() + shine + w + '<path d="M39.6 32.8q.8 1.8 0 3" stroke="#8ec9f0" stroke-width="1.3" fill="none" stroke-linecap="round"/>'],
    ['부끄', '<path d="M29.6 28q2 1.8 4 0M42.4 28q2 1.8 4 0" stroke="{k}" stroke-width="1.6" fill="none" stroke-linecap="round"/>' + blush + '<path d="M37 32.4h2" stroke="{k}" stroke-width="1.3" stroke-linecap="round"/>'],
    ['씨익', eyes(1.9) + '<path d="M35.6 31.4q2.4 2.6 4.8 0" stroke="{k}" stroke-width="1.4" fill="none" stroke-linecap="round"/>'],
  ];
  const glass = [
    ['없음', ''],
    ['볼터치', blush],
    ['선글라스', '<rect x="27.6" y="23.6" width="9.6" height="6.8" rx="2.8" fill="#1f2328"/><rect x="39.6" y="23.6" width="9.6" height="6.8" rx="2.8" fill="#1f2328"/><path d="M37 26.4h3" stroke="#1f2328" stroke-width="1.8"/>'],
    ['동그란 안경', '<circle cx="31.8" cy="28.2" r="4.4" fill="none" stroke="#7a4b2a" stroke-width="1.6"/><circle cx="44.6" cy="28.2" r="4.4" fill="none" stroke="#7a4b2a" stroke-width="1.6"/><path d="M36.2 27.8h4" stroke="#7a4b2a" stroke-width="1.4"/>'],
    ['반창고', '<g transform="rotate(-25 46 33)"><rect x="41" y="31" width="10" height="4" rx="2" fill="#f4c9a0"/><rect x="44.6" y="31" width="2.8" height="4" fill="#e8b384"/></g>'],
    ['콧수염', '<path d="M33 34q2.6-2.2 5-.2q2.4-2 5 .2q-2.4 1.6-5 .2q-2.6 1.4-5-.2z" fill="#5e3d2a"/>'],
    ['마스크', '<path d="M27.6 30.6q-2-.2-2.6 1.8M48.4 30.6q2-.2 2.6 1.8" stroke="#cfd6dd" stroke-width="1" fill="none"/><rect x="28" y="29.6" width="20" height="8" rx="3.4" fill="#fff" stroke="#cfd6dd" stroke-width="1"/><path d="M31 32.6h14M31 34.8h14" stroke="#e3e8ed" stroke-width=".8"/>'],
  ];
  const head = [
    ['없음', ''],
    ['리본', '<g transform="translate(44.6 9.4) scale(1.7)"><path d="M0 0l4.2-3.2v6.4zM0 0l-4.2-3.2v6.4z" fill="#ff5a6e"/><circle r="1.4" fill="#e23e55"/></g>'],
    ['꽃', '<g transform="translate(31 9.6) scale(1.5)"><circle cx="0" cy="-3" r="2.5" fill="#ff8ab0"/><circle cx="2.9" cy="-.9" r="2.5" fill="#ff8ab0"/><circle cx="1.8" cy="2.5" r="2.5" fill="#ff8ab0"/><circle cx="-1.8" cy="2.5" r="2.5" fill="#ff8ab0"/><circle cx="-2.9" cy="-.9" r="2.5" fill="#ff8ab0"/><circle r="1.8" fill="#ffd34d"/></g>'],
    ['왕관', '<path d="M29.5 17.5l1.4-9.5 3.8 4.4 3.3-6.4 3.3 6.4 3.8-4.4 1.4 9.5z" fill="#ffd34d" stroke="#d49a12" stroke-width="1.2" stroke-linejoin="round"/>'],
    ['비니', '<path d="M25.6 22Q26 4.6 38 4Q50 4.6 51 20.6Q38 16.4 25.6 22z" fill="#ffd34d"/><path d="M25.4 21.6Q38 15.6 51.2 20.2l.4 3.6Q38 19.4 25.8 25.4z" fill="#f2a100"/><circle cx="38" cy="3.6" r="3.2" fill="#fff"/>'],
    ['캡모자', '<path d="M26 21Q26.4 7 38 6.4Q49.6 7 50 19Q38 15.4 26 21z" fill="#3b82f6"/><path d="M48 18.6Q56 17 60 21Q54 23.4 49.4 22z" fill="#2563c9"/><circle cx="38" cy="7" r="1.6" fill="#2563c9"/>'],
    ['밀짚모자', '<ellipse cx="38" cy="19" rx="18" ry="4.6" fill="#f5d48a" stroke="#c9a14b" stroke-width="1"/><path d="M29 18Q29.6 7.6 38 7.4Q46.4 7.6 47 18z" fill="#f5d48a" stroke="#c9a14b" stroke-width="1"/><path d="M29.2 15.6Q38 13.6 46.8 15.6v2.4Q38 16 29.2 18z" fill="#ff6a47"/>'],
    ['새싹', '<path d="M38 17V9" stroke="#3aa35b" stroke-width="2" stroke-linecap="round"/><path d="M38 10Q32 4 28.6 7.6Q32.6 11.6 38 10z" fill="#5cc97a"/><path d="M38 10Q44 4 47.4 7.6Q43.4 11.6 38 10z" fill="#5cc97a"/>'],
    ['별 핀', '<path d="M45 4.6l1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5z" fill="#ffd34d" stroke="#d49a12" stroke-width=".8" stroke-linejoin="round"/>'],
    ['헤드폰', '<path d="M25 31Q24.6 7.4 38.2 7.4Q51.8 7.4 51.4 31" stroke="#2b2f36" stroke-width="3.2" fill="none" stroke-linecap="round"/><rect x="20.6" y="26" width="8" height="12" rx="3.4" fill="#ff6a47"/><rect x="47.8" y="26" width="8" height="12" rx="3.4" fill="#ff6a47"/>'],
    ['토끼 귀 머리띠', '<path d="M30.6 15.6Q25 2 28.4 1.2Q32.6 1 34 14.6z" fill="#fff" stroke="#e6d6dd" stroke-width="1"/><path d="M41.6 14.6Q43 1 47.2 1.2Q50.6 2 45 15.6z" fill="#fff" stroke="#e6d6dd" stroke-width="1"/><path d="M30 6.6Q30 3.4 31.2 3.8Q32.4 5 32.6 11z" fill="#ffc2cf"/><path d="M43.4 11Q43.6 5 44.8 3.8Q46 3.4 46 6.6z" fill="#ffc2cf"/>'],
  ];
  const neck = [
    ['없음', ''],
    ['목도리', '<path d="M13.4 38.6Q32 46 51.8 38.4L52.8 45Q32 52.6 12.6 45.2z" fill="#ff6a47"/><path d="M40.6 44.6l3.4 9.6h-7z" fill="#e2502e"/>'],
    ['방울 목걸이', '<path d="M13.6 40Q32 46.4 51.6 39.6" stroke="#ff4f6d" stroke-width="2.6" fill="none"/><circle cx="33" cy="46.4" r="3.4" fill="#ffd34d" stroke="#d49a12" stroke-width=".8"/><path d="M31.4 47.6h3.2" stroke="#d49a12" stroke-width=".8"/>'],
    ['나비넥타이', '<path d="M32.6 43l-7-4.4v8.8zM32.6 43l7-4.4v8.8z" fill="#3b82f6"/><circle cx="32.6" cy="43" r="1.9" fill="#2563c9"/>'],
    ['카메라', '<path d="M18 38Q32 50 47 38" stroke="#2b2f36" stroke-width="1.4" fill="none"/><rect x="25.4" y="41.6" width="14" height="9.6" rx="2" fill="#2b2f36"/><circle cx="32.4" cy="46.4" r="3" fill="#9fd8ff" stroke="#fff" stroke-width="1"/><rect x="35.6" y="40.2" width="2.8" height="1.8" rx=".6" fill="#2b2f36"/>'],
    ['목베개', '<path d="M14 39.4Q32 49 51.4 38.8Q53 46 32 50Q11.4 46.6 14 39.4z" fill="#9fd8c4" stroke="#5fb79a" stroke-width="1"/>'],
    ['손수건', '<path d="M14 39.4Q32 45.6 51.6 39L33 54z" fill="#ffd34d"/><circle cx="26" cy="43" r=".9" fill="#fff"/><circle cx="33" cy="47" r=".9" fill="#fff"/><circle cx="40" cy="43" r=".9" fill="#fff"/>'],
  ];
  const hand = [
    ['없음', ''],
    ['나무 막대기', '<path d="M50 54L58 22" stroke="#a0703f" stroke-width="3" stroke-linecap="round"/><path d="M56.4 28.4l3.6-2.2" stroke="#a0703f" stroke-width="2" stroke-linecap="round"/><ellipse cx="57.6" cy="23.6" rx="2.6" ry="1.6" fill="#5cc97a" transform="rotate(-30 57.6 23.6)"/>'],
    ['뿅망치', '<path d="M52 54L56 30" stroke="#ffd34d" stroke-width="2.6" stroke-linecap="round"/><rect x="48" y="20.6" width="15" height="9" rx="3.6" fill="#ff5a6e" transform="rotate(10 55.5 25)"/><rect x="48" y="23.4" width="15" height="3" fill="#ffd34d" transform="rotate(10 55.5 25)"/>'],
    ['잠자리채', '<path d="M51 54L56.4 30" stroke="#c9a14b" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="57.6" cy="23" rx="5.2" ry="6.6" fill="#ffffff" fill-opacity=".55" stroke="#2fa8a0" stroke-width="1.8"/><path d="M54 20.4l7 5M54 25.4l7-5" stroke="#2fa8a0" stroke-width=".6" opacity=".7"/>'],
    ['냄비뚜껑 방패', '<circle cx="54.6" cy="40" r="8.6" fill="#c3c9d2" stroke="#7d8794" stroke-width="1.6"/><circle cx="54.6" cy="40" r="5" fill="none" stroke="#9aa3ad" stroke-width="1"/><rect x="52.6" y="38.6" width="4" height="2.8" rx="1.2" fill="#2b2f36"/>'],
    ['작은 삽', '<path d="M51.4 52L56 30" stroke="#a0703f" stroke-width="2.4" stroke-linecap="round"/><path d="M53.8 31.6l5.8 1.2-1.6 7.6q-3.6.6-5.6-1.8z" fill="#9aa3ad" stroke="#6b7480" stroke-width=".8"/><rect x="54.4" y="25" width="4.6" height="2.4" rx="1" fill="#2b2f36" transform="rotate(12 56.7 26.2)"/>'],
    ['랜턴', '<path d="M55 24v-3" stroke="#2b2f36" stroke-width="1.4"/><rect x="50.6" y="26" width="9" height="12" rx="2.4" fill="#ffe08a" stroke="#c9a14b" stroke-width="1.2"/><rect x="50" y="24.4" width="10.2" height="2.6" rx="1" fill="#2b2f36"/><rect x="50" y="37.4" width="10.2" height="2.6" rx="1" fill="#2b2f36"/><circle cx="55.1" cy="32" r="2.2" fill="#ff9a3c"/>'],
    ['풍선', '<path d="M52 52Q56 44 55 33" stroke="#7d8794" stroke-width="1" fill="none"/><ellipse cx="55.4" cy="25.4" rx="6" ry="7.4" fill="#ff8ab0"/><path d="M54.4 33l1-1.4 1 1.4z" fill="#ff8ab0"/><ellipse cx="53.4" cy="22.6" rx="1.4" ry="2.2" fill="#fff" opacity=".6"/>'],
    ['캐리어', '<rect x="47.6" y="38" width="13" height="15" rx="3" fill="#3b82f6"/><path d="M51 38v-3.4h6.2V38" stroke="#2b2f36" stroke-width="1.6" fill="none"/><path d="M47.6 44h13" stroke="#2563c9" stroke-width="1.2"/><circle cx="50.6" cy="54" r="1.3" fill="#2b2f36"/><circle cx="57.6" cy="54" r="1.3" fill="#2b2f36"/>'],
    ['지도', '<path d="M47.4 30l5-2 4.6 2 5-2v14l-5 2-4.6-2-5 2z" fill="#fff3dc" stroke="#c9a14b" stroke-width="1"/><path d="M52.4 28v14M57 30v14" stroke="#c9a14b" stroke-width=".8"/><path d="M49 37l3 -2 3 3 4-3" stroke="#ff5a6e" stroke-width="1" fill="none" stroke-dasharray="1.4 1"/>'],
  ];
  return { coat, face, glass, head, neck, hand };
})();
// 꾸미기 창의 칸 순서와 이름
const CAT_SLOTS = [['c', '털 무늬'], ['p', '무늬 색'], ['e', '표정'], ['g', '얼굴 소품'], ['h', '머리'], ['n', '목'], ['d', '모험 도구'], ['t', '배경']];
let catSeq = 0;
function logoCat(o = {}) {
  const P = CAT_PARTS, n = (k, list) => { const v = Math.floor(+o[k] || 0); return v >= 0 && v < list.length ? v : 0; };
  const ci = n('c', P.coat), pi = n('p', CAT_PAT), ti = n('t', CAT_TILES);
  const [, cv, darkRule] = P.coat[ci], pc = CAT_PAT[pi][1];
  const body = typeof cv === 'function' ? cv(pc) : cv;
  // 표정 잉크: 털이 없으면 로고처럼 흰색, 어두운 털이면 밝게
  const dark = (darkRule === 'tile' && ti < 6) || darkRule === true || (typeof darkRule === 'function' && darkRule(pi));
  const ink = dark ? '#fffaf0' : '#2b2622';
  const id = 'cat' + (catSeq++).toString(36);
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="${CAT_FILL}"/></clipPath></defs><rect width="64" height="64" rx="16" fill="${CAT_TILES[ti]}"/>`
    + '<g transform="translate(32 32) scale(.9) translate(-31 -31.5)">'
    + (body ? `<g clip-path="url(#${id})">${body}</g>` : '')
    + P.neck[n('n', P.neck)][1]
    + `<path d="${CAT_LOGO}" fill="none" stroke="#fff" stroke-width="3.65" stroke-linecap="round" stroke-linejoin="round"/>`
    + P.face[n('e', P.face)][1].replace(/\{k\}/g, ink)
    + P.glass[n('g', P.glass)][1]
    + P.head[n('h', P.head)][1]
    + P.hand[n('d', P.hand)][1]
    + '</g></svg>';
}
const catOpts = (slot) => (slot === 'p' ? CAT_PAT : slot === 't' ? CAT_TILES.map((c, i) => [`배경 ${i + 1}`, c]) : CAT_PARTS[{ c: 'coat', e: 'face', g: 'glass', h: 'head', n: 'neck', d: 'hand' }[slot]]);
const catHasPat = (o) => typeof CAT_PARTS.coat[+o.c || 0]?.[1] === 'function';
if (typeof module !== 'undefined') module.exports = { logoCat, CAT_PARTS, CAT_SLOTS, CAT_TILES, CAT_PAT, catOpts, catHasPat };
