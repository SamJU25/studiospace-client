import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromHeaders } from "./lib/auth";

export async function proxy(request: NextRequest) {
  try {
    const session = await getSessionFromHeaders(request.headers);

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/add-studio",
    "/my-listings",
    "/my-bookings",
    "/dashboard",
    "/wishlist",
    "/studios/edit/:path*",
  ],
};
