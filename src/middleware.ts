import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isIdeRoute = req.nextUrl.pathname.startsWith("/ide");

  if (isIdeRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  
  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") && isLoggedIn) {
    return NextResponse.redirect(new URL("/ide", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
