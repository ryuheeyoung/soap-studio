import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/session";

/**
 * @function
 * @description 인증되지 않은 요청을 로그인 페이지로 리다이렉트하는 미들웨어
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 통과
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isValidSession(token)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 정적 파일, _next 내부 경로 제외하고 모든 요청에 적용
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
