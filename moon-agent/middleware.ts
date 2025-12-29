import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/welcome",
  "/login",
  "/register",
  "/api/auth"
];

// Check if the path starts with any public route
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes to pass through (except our protected APIs)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/protected")) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isLoggedIn = !!token;
  const isPublic = isPublicRoute(pathname);

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (pathname === "/welcome" || pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Redirect unauthenticated users to welcome page
  if (!isLoggedIn && !isPublic) {
    const redirectUrl = new URL("/welcome", request.url);
    // Optionally store the original URL to redirect back after login
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
