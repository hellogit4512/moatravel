/*
 * 지도 키 설정 — 여기에 넣으면 이 사이트를 여는 모든 사람에게 적용돼요.
 *
 * 카카오 (국내 여행): https://developers.kakao.com → 내 애플리케이션 → 앱 키 → "JavaScript 키"
 *   · 플랫폼 → Web → 사이트 도메인에 https://hellogit4512.github.io 등록
 *   · 카카오맵 사용 설정 ON
 * 구글 (해외 여행): Google Cloud → Maps JavaScript API + Places API (New) 사용 설정 → API 키
 *   · 키 제한: HTTP 리퍼러 https://hellogit4512.github.io/*
 *
 * 비워두면 OpenStreetMap 지도·검색으로 대신 동작해요.
 */
window.MOA_CONFIG = {
  kakaoKey: '',
  googleKey: '',
  // 실시간 공유방 서버 (moa-travel-server 폴더의 Cloudflare Worker)
  syncUrl: /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://127.0.0.1:8787' : 'https://moatravel-rooms.moatravel.workers.dev',
};
