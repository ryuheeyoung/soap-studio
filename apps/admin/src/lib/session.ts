// 세션 쿠키 이름 및 유효 기간 상수
export const SESSION_COOKIE = "admin-session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

/**
 * @function
 * @description 세션 토큰 생성 — 환경변수 비밀번호와 시크릿을 조합한 간단한 서명값
 * @returns {string} 세션 토큰
 */
export function createSessionToken(): string {
  const secret = process.env.SESSION_SECRET ?? "fallback-secret";
  return Buffer.from(`authenticated:${secret}`).toString("base64");
}

/**
 * @function
 * @description 세션 토큰 유효성 검증
 * @param {string | undefined} token - 쿠키에서 읽은 토큰값
 * @returns {boolean} 유효 여부
 */
export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const expected = createSessionToken();
    return token === expected;
  } catch {
    return false;
  }
}
