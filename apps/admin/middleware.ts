import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/session";

/**
 * @function
 * @description 관리자 인증 미들웨어. 로그인 페이지와 API 외 모든 경로를 세션으로 보호
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지와 인증 API는 통과
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
