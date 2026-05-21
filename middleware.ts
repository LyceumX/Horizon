import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SKIP_PREFIXES = ["/api", "/_next", "/assets", "/favicon"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/cn") || pathname.startsWith("/global")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const isCNSubdomain = host.startsWith("cn.");

  const response = NextResponse.rewrite(
    new URL(isCNSubdomain ? `/cn${pathname}` : `/global${pathname}`, request.url)
  );

  if (!request.cookies.get("horizon-lang")) {
    const country =
      request.geo?.country ?? request.headers.get("x-vercel-ip-country") ?? "";
    const language = country.toUpperCase() === "CN" || isCNSubdomain ? "zh" : "en";
    response.cookies.set("horizon-lang", language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\..*).*)"],
};
