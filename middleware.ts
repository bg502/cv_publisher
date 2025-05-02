import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next()

  // Add security headers with more permissive settings for PDF viewing
  const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.vercel-storage.com https://*.blob.vercel-storage.com;
    font-src 'self';
    object-src 'self' blob: data: https://*.vercel-storage.com https://*.blob.vercel-storage.com;
    frame-src 'self' https://docs.google.com https://*.vercel-storage.com https://*.blob.vercel-storage.com;
    connect-src 'self' https://*.vercel-storage.com https://*.blob.vercel-storage.com;
  `

  response.headers.set("Content-Security-Policy", ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim())
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return response
}

// Only run middleware on the following paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}
