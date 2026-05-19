import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get("horizon-lang");
  if (existing) {
    return NextResponse.next();
  }

  const country = request.geo?.country || request.headers.get("x-vercel-ip-country") || "";
  const language = country.toUpperCase() === "CN" ? "zh" : "en";

  const response = NextResponse.next();
  response.cookies.set("horizon-lang", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"]
};
