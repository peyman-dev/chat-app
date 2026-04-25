import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, validateSessionToken } from "@/lib/auth/session-token";

const AUTH_ROUTE_PREFIX = "/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await validateSessionToken(sessionToken);

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

