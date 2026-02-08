import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  const protectedPaths = [
    "/admin",
    "/dashboard",
    "/profile",
    "/contests",
    "/documents",
    "/problems",
    "/user",
    "/api",
  ];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/contests/:path*",
    "/documents/:path*",
    "/problems/:path*",
    "/user/:path*",
    "/api/:path*",
  ],
};
