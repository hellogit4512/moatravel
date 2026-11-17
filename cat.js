/* 모아여행 프로필 고양이: 앱 로고 고양이 선 그대로 + 털 무늬 · 표정 · 소품을 골라 꾸며요
 * 설정 값(m.cat): { c: 털 무늬, p: 무늬 색, t: 배경, e: 표정, g: 얼굴 소품, h: 머리, n: 목, d: 모험 도구 } — 모두 번호
 */
const CAT_LOGO = 'M22.7 27.6 L31.2 9.6 L38.2 17.5 L44.1 8.9 L52.2 38 C53.6 44 53 50 48 52 C42 53.6 22 53.6 16 52.4 C10.8 51 9.8 46.6 10.2 41 C10.4 37.4 11 33.6 12 29.4';
const CAT_FILL = CAT_LOGO + ' L22.7 27.6 Z';
const CAT_REST = ' C53.6 44 53 50 48 52 C42 53.6 22 53.6 16 52.4 C10.8 51 9.8 46.6 10.2 41 C10.4 37.4 11 33.6 12 29.4';
const CAT_LINE = (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="3.65" stroke-linecap="round" stroke-linejoin="round"/>`;
// [이름, 몸 선, 몸 밖에 덧그리는 선(꼬리 등)]
const CAT_KINDS = [
  ['고양이', CAT_LOGO, ''],
  ['토끼', 'M22.7 27.6 L27.4 19.4 L29.6 1.8 L35.2 3.4 L36 17.6 L40.4 17.4 L43.6 1.4 L49 3.6 L46.6 20 L52.2 38' + CAT_REST, ''],
  ['날다람쥐', 'M22.7 27.6 L28.4 15.4 Q31 11.6 33.6 14.6 L37.6 18 L42.4 14.2 Q45.4 11.8 47.4 15.4 L52.2 38' + CAT_REST,
    '<path d="M51.8 50.8C62 50.6 64.6 39 60.8 30.6C58.4 25.4 53.2 23.6 50.8 27.4C49.6 29.6 51.4 32.4 54.2 31.4C55.6 36.8 54.6 42.6 51.4 45.4z" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"/>'],
  ['해달', 'M22.7 27.6 Q26 15.6 37.4 15Q49 15.4 51.2 27 L52.2 38' + CAT_REST,
    '<circle cx="26.6" cy="18.4" r="1.7" fill="#fff"/><circle cx="48.4" cy="18.4" r="1.7" fill="#fff"/>'],
  ['곰돌이', 'M22.7 27.6 L26.6 18.6 A4.6 4.6 0 0 1 34.6 14.8 L37.8 16.8 L41.6 14.4 A4.6 4.6 0 0 1 49.6 17.6 L52.2 38' + CAT_REST, ''],
];
const CAT_TILES = ['#0fa37a', '#ff6a47', '#3b82f6', '#f2a100', '#8b5cf6', '#1f2a26', '#9fd8c4', '#ffc2cf', '#bcd7ff', '#ffe08a', '#d9c8ff', '#e9e3d9', '#7fd3e6', '#2a7fb8', '#ffd7c2'];
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
    ['하양', R(C.white)], ['노랑', R('#ffe27a')], ['연하늘', R('#cfe9ff')], ['연보라', R('#e6dcff')], ['복숭아', R('#ffd2bd')],
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
    ['토끼 후드 (분홍)', '<path d="M29.4 13.6Q24.6-2.4 29-3.4Q33.4-3.6 34.4 11.6z" fill="#ffc8d4" stroke="#f29bb2" stroke-width="1"/><path d="M41.8 11.4Q43.4-3.6 47.8-3.2Q51.6-1.6 46.4 13.8z" fill="#ffc8d4" stroke="#f29bb2" stroke-width="1"/><path d="M30.6 9Q29 1 30.6.2Q32 .6 32.6 9z" fill="#ffc2cf"/><path d="M44 9Q44.8.8 46.2.6Q47.6 1.6 45.8 9.4z" fill="#ffc2cf"/><path d="M22.6 33Q20.6 9.6 38 9Q55.4 9.6 53.4 33Q52.6 24.2 47 21.4Q38 17.6 29 21.4Q23.4 24.2 22.6 33z" fill="#ffc8d4" stroke="#f29bb2" stroke-width="1"/>'],
    ['토끼 후드 (흰)', '<path d="M29.4 13.6Q24.6-2.4 29-3.4Q33.4-3.6 34.4 11.6z" fill="#ffffff" stroke="#dcd3d8" stroke-width="1"/><path d="M41.8 11.4Q43.4-3.6 47.8-3.2Q51.6-1.6 46.4 13.8z" fill="#ffffff" stroke="#dcd3d8" stroke-width="1"/><path d="M30.6 9Q29 1 30.6.2Q32 .6 32.6 9z" fill="#ffc2cf"/><path d="M44 9Q44.8.8 46.2.6Q47.6 1.6 45.8 9.4z" fill="#ffc2cf"/><path d="M22.6 33Q20.6 9.6 38 9Q55.4 9.6 53.4 33Q52.6 24.2 47 21.4Q38 17.6 29 21.4Q23.4 24.2 22.6 33z" fill="#ffffff" stroke="#dcd3d8" stroke-width="1"/>'],
    ['토끼 후드 (노랑)', '<path d="M29.4 13.6Q24.6-2.4 29-3.4Q33.4-3.6 34.4 11.6z" fill="#ffe066" stroke="#e0b520" stroke-width="1"/><path d="M41.8 11.4Q43.4-3.6 47.8-3.2Q51.6-1.6 46.4 13.8z" fill="#ffe066" stroke="#e0b520" stroke-width="1"/><path d="M30.6 9Q29 1 30.6.2Q32 .6 32.6 9z" fill="#ffc2cf"/><path d="M44 9Q44.8.8 46.2.6Q47.6 1.6 45.8 9.4z" fill="#ffc2cf"/><path d="M22.6 33Q20.6 9.6 38 9Q55.4 9.6 53.4 33Q52.6 24.2 47 21.4Q38 17.6 29 21.4Q23.4 24.2 22.6 33z" fill="#ffe066" stroke="#e0b520" stroke-width="1"/>'],
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
    ['면봉', '<path d="M49.6 52L58.4 22.6" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/><path d="M49.6 52L58.4 22.6" stroke="#ffd34d" stroke-width="1" stroke-linecap="round" opacity=".7"/><ellipse cx="58.8" cy="21.4" rx="2.4" ry="3.4" fill="#fff" stroke="#e3e8ed" stroke-width=".8" transform="rotate(16 58.8 21.4)"/><ellipse cx="49.2" cy="53.2" rx="2.4" ry="3.4" fill="#fff" stroke="#e3e8ed" stroke-width=".8" transform="rotate(16 49.2 53.2)"/>'],
    ['요술봉', '<path d="M51 54L56.4 31" stroke="#c9b6ff" stroke-width="2.4" stroke-linecap="round"/><path d="M57.4 18.6l2 4.1 4.5.6-3.3 3.2.8 4.5-4-2.1-4 2.1.8-4.5-3.3-3.2 4.5-.6z" fill="#ffd34d" stroke="#d49a12" stroke-width=".8" stroke-linejoin="round"/><circle cx="52" cy="20" r=".9" fill="#fff"/><circle cx="62" cy="33" r=".9" fill="#fff"/>'],
    ['낚싯대', '<path d="M49 54Q53 34 61 20" stroke="#a0703f" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M61 20Q63 30 62 38" stroke="#7d8794" stroke-width=".8" fill="none"/><path d="M58.6 40.4q3.4-3 6.6 0q-3.2 3-6.6 0z" fill="#3b82f6"/><path d="M58.8 40.4l-2.2-1.6v3.2z" fill="#3b82f6"/><circle cx="53.4" cy="42" r="1.6" fill="none" stroke="#a0703f" stroke-width="1"/>'],
    ['효자손', '<path d="M51 54L57.4 26" stroke="#c98c4e" stroke-width="2.4" stroke-linecap="round"/><path d="M54.4 25.6q.6-3.6 3.6-3.4q3.2.4 2.6 4.2" fill="#e8b57c" stroke="#a0703f" stroke-width=".8"/><path d="M55.4 22.6v-2M57.2 22v-2.2M59 22.4v-2" stroke="#a0703f" stroke-width="1" stroke-linecap="round"/>'],
    ['토벌봉 (하늘)', '<g transform="translate(51 57) scale(.72) translate(-51 -57)"><path d="M51 56.4L54.6 34" stroke="#3d8fc9" stroke-width="5" stroke-linecap="round"/><path d="M51 56.4L54.6 34" stroke="#7cc4ef" stroke-width="3.6" stroke-linecap="round"/><path d="M50.2 58.4l1.4-5.6" stroke="#e3e8ed" stroke-width="5" stroke-linecap="round"/><path d="M50.2 58.4l1.4-5.6" stroke="#fff" stroke-width="3.8" stroke-linecap="round"/><path d="M54.6 34.4Q50.8 31 50.4 25Q50.2 19.4 47.6 15.2" stroke="#3d8fc9" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q50.8 31 50.4 25Q50.2 19.4 47.6 15.2" stroke="#7cc4ef" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q58.8 31.2 59.8 25.2Q60.6 19.4 63.4 15.6" stroke="#3d8fc9" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q58.8 31.2 59.8 25.2Q60.6 19.4 63.4 15.6" stroke="#7cc4ef" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M49 28.4l-2.6 1l2.6 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/><path d="M48.6 23.6l-2.6 0.8l2.6 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/><path d="M47.4 18.8l-2.4 0.6l2.4 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/><path d="M61.2 28.2l2.4 1l-2.4 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/><path d="M61.6 23.4l2.4 0.8l-2.4 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/><path d="M62.4 18.8l2.2 0.6l-2.2 1z" fill="#fff" stroke="#3d8fc9" stroke-width=".5" stroke-linejoin="round"/></g>'],
    ['토벌봉 (분홍)', '<g transform="translate(51 57) scale(.72) translate(-51 -57)"><path d="M51 56.4L54.6 34" stroke="#d9607e" stroke-width="5" stroke-linecap="round"/><path d="M51 56.4L54.6 34" stroke="#ff9fb4" stroke-width="3.6" stroke-linecap="round"/><path d="M50.2 58.4l1.4-5.6" stroke="#e3e8ed" stroke-width="5" stroke-linecap="round"/><path d="M50.2 58.4l1.4-5.6" stroke="#fff" stroke-width="3.8" stroke-linecap="round"/><path d="M54.6 34.4Q50.8 31 50.4 25Q50.2 19.4 47.6 15.2" stroke="#d9607e" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q50.8 31 50.4 25Q50.2 19.4 47.6 15.2" stroke="#ff9fb4" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q58.8 31.2 59.8 25.2Q60.6 19.4 63.4 15.6" stroke="#d9607e" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M54.6 34.4Q58.8 31.2 59.8 25.2Q60.6 19.4 63.4 15.6" stroke="#ff9fb4" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M49 28.4l-2.6 1l2.6 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/><path d="M48.6 23.6l-2.6 0.8l2.6 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/><path d="M47.4 18.8l-2.4 0.6l2.4 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/><path d="M61.2 28.2l2.4 1l-2.4 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/><path d="M61.6 23.4l2.4 0.8l-2.4 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/><path d="M62.4 18.8l2.2 0.6l-2.2 1z" fill="#fff" stroke="#d9607e" stroke-width=".5" stroke-linejoin="round"/></g>'],
  ];
  const scales = (c) => [44, 48, 52].map((y, r) => Array.from({ length: 9 }, (_, i) => `<path d="M${8 + i * 5.4 + (r % 2) * 2.7} ${y}q2.7 2.6 5.4 0" stroke="${c}" stroke-width="1" fill="none" opacity=".75"/>`).join('')).join('');
  const merm = (c, d) => [
    `<rect x="0" y="40.6" width="64" height="24" fill="${c}"/><path d="M8 41Q30 46 56 40.4" stroke="${d}" stroke-width="1.6" fill="none"/>` + scales(d),
    `<path d="M47 50.6Q53.6 47.6 55.4 41.4Q58.6 47 63.4 46.2Q61.6 52.4 56.4 54.6Q60.4 58.6 59.6 63Q53.4 60.4 49.6 55.2z" fill="${c}" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M55.4 44l1.2 7M58.4 57.6l-4.4-3.2M60.4 48.6l-4 3.4" stroke="${d}" stroke-width="1" opacity=".85" stroke-linecap="round"/>`,
  ];
  const tail = [
    ['없음', ['', '']],
    ['인어 꼬리 (민트)', merm('#8fe3cf', '#3fb393')],
    ['인어 꼬리 (분홍)', merm('#ffb7c9', '#e5708c')],
    ['인어 꼬리 (보라)', merm('#c9b2ff', '#8b5cf6')],
    ['인어 꼬리 (하늘)', merm('#a8dcff', '#3d8fc9')],
  ];
  head.push(
    ['조개 왕관', '<path d="M31.4 17.6Q31 9.6 38 8.6Q45 9.6 44.6 17.6z" fill="#ffd9e4" stroke="#e5708c" stroke-width="1"/><path d="M38 8.8V17.4M34.4 10.4l1.6 7M41.6 10.4l-1.6 7" stroke="#e5708c" stroke-width=".9"/><circle cx="38" cy="7.6" r="1.6" fill="#fff" stroke="#e3e8ed" stroke-width=".6"/>'],
    ['불가사리 핀', '<path d="M44.4 3.6l1.6 3.8 4-.4-3 2.8 1.4 3.8-3.6-2-3.4 2.2 1.2-3.9-3.1-2.6 4-.2z" fill="#ff9a6b" stroke="#e2643a" stroke-width=".9" stroke-linejoin="round"/><circle cx="44.6" cy="8.6" r=".6" fill="#fff"/><circle cx="46.2" cy="9.4" r=".5" fill="#fff"/>'],
  );
  neck.push(
    ['진주 목걸이', Array.from({ length: 11 }, (_, i) => { const t = i / 10, x = 14 + t * 37.6, y = 40.4 + Math.sin(t * Math.PI) * 5.4 - t * .6; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="#fffaf2" stroke="#e3d6c6" stroke-width=".6"/>`; }).join('')],
  );
  hand.push(
    ['산호 지팡이', '<path d="M51.6 55L55.4 31" stroke="#ff7f8f" stroke-width="2.8" stroke-linecap="round"/><path d="M55 33.6Q51.4 30 52.4 24.8M55.4 31Q58.8 27.6 58 22.6M54.4 27.4Q56.4 24.8 55.2 21.4M57.6 25.6Q60.6 24.6 60.6 21.4" stroke="#ff7f8f" stroke-width="2.2" fill="none" stroke-linecap="round"/>'],
    ['물방울 거품', '<circle cx="55.6" cy="38" r="3.6" fill="#dff4ff" fill-opacity=".7" stroke="#8ec9f0" stroke-width="1"/><circle cx="58.8" cy="29.6" r="2.4" fill="#dff4ff" fill-opacity=".7" stroke="#8ec9f0" stroke-width="1"/><circle cx="55" cy="23.6" r="1.6" fill="#dff4ff" fill-opacity=".7" stroke="#8ec9f0" stroke-width="1"/><circle cx="54.4" cy="36.8" r=".8" fill="#fff"/>'],
  );
  return { coat, face, glass, head, neck, hand, tail };
})();
// 꾸미기 창의 칸 순서와 이름
// 하치와레는 하늘색 가르마가 기본이에요
const catPatList = (ci) => (+ci === 12 ? [CAT_PAT[1], CAT_PAT[0], ...CAT_PAT.slice(2)] : CAT_PAT);
const CAT_SLOTS = [['s', '친구'], ['c', '털 무늬'], ['p', '무늬 색'], ['e', '표정'], ['g', '얼굴 소품'], ['h', '머리'], ['n', '목'], ['b', '인어 꼬리'], ['d', '모험 도구'], ['t', '배경']];
let catSeq = 0;
function logoCat(o = {}) {
  const P = CAT_PARTS, n = (k, list) => { const v = Math.floor(+o[k] || 0); return v >= 0 && v < list.length ? v : 0; };
  const [, line, extra] = CAT_KINDS[n('s', CAT_KINDS)], fill = line + ' L22.7 27.6 Z', [tb, tf] = P.tail[n('b', P.tail)][1];
  const ci = n('c', P.coat), pl = catPatList(ci), pi = n('p', pl), ti = n('t', CAT_TILES);
  const [, cv, darkRule] = P.coat[ci], pc = pl[pi][1];
  const body = typeof cv === 'function' ? cv(pc) : cv;
  // 표정 잉크: 털이 없으면 로고처럼 흰색, 어두운 털이면 밝게
  const dark = (darkRule === 'tile' && ti < 6) || darkRule === true || (typeof darkRule === 'function' && darkRule(pi));
  const ink = dark ? '#fffaf0' : '#2b2622';
  const id = 'cat' + (catSeq++).toString(36);
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="${fill}"/></clipPath></defs><rect width="64" height="64" rx="16" fill="${CAT_TILES[ti]}"/>`
    + '<g transform="translate(32 32) scale(.9) translate(-31 -31.5)">'
    + (body || tb ? `<g clip-path="url(#${id})">${body}${tb}</g>` : '') + tf
    + P.neck[n('n', P.neck)][1]
    + CAT_LINE(line) + extra
    + P.face[n('e', P.face)][1].replace(/\{k\}/g, ink)
    + P.glass[n('g', P.glass)][1]
    + P.head[n('h', P.head)][1]
    + P.hand[n('d', P.hand)][1]
    + '</g></svg>';
}
const catOpts = (slot, o = {}) => (slot === 's' ? CAT_KINDS : slot === 'p' ? catPatList(o.c) : slot === 't' ? CAT_TILES.map((c, i) => [`배경 ${i + 1}`, c]) : CAT_PARTS[{ c: 'coat', e: 'face', g: 'glass', h: 'head', n: 'neck', d: 'hand', b: 'tail' }[slot]]);
const catHasPat = (o) => typeof CAT_PARTS.coat[+o.c || 0]?.[1] === 'function';
// 대화방 스티커: 내가 꾸민 캐릭터가 표정·소품만 바꿔서 나와요 (o 에 덮어써요)
const CAT_STICKERS = [
  ['좋아!', { e: 10, g: 1 }], ['최고', { e: 5 }], ['출발!', { e: 6, d: 8 }], ['사진 찍자', { e: 1, n: 4 }],
  ['배고파', { e: 13 }], ['졸려', { e: 4 }], ['어디야?', { e: 8, d: 9 }], ['보냈어', { e: 15 }],
  ['부탁해', { e: 14, g: 1 }], ['아쉬워', { e: 7 }], ['화났어', { e: 11 }], ['메롱', { e: 9 }],
];
const catSticker = (o, i) => { const st = CAT_STICKERS[i]; return st ? logoCat({ ...(o || {}), g: 0, ...st[1] }) : ''; };
if (typeof module !== 'undefined') module.exports = { catSticker, CAT_STICKERS, logoCat, CAT_KINDS, CAT_PARTS, CAT_SLOTS, CAT_TILES, CAT_PAT, catOpts, catHasPat };
