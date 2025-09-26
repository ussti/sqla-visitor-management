import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers for HTTPS enforcement and protection
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // HSTS (HTTP Strict Transport Security) - Force HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Content Security Policy for XSS protection
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:", // Allow images from HTTPS sources and data URLs
    "media-src 'self' blob:", // Allow camera/microphone access
    "connect-src 'self' https:", // Allow API calls to HTTPS endpoints
    "frame-src 'none'", // Prevent framing
    "object-src 'none'", // Prevent object/embed
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'camera=(self)', // Allow camera access for photo capture
    'microphone=()', // Disable microphone
    'geolocation=()', // Disable geolocation
    'payment=()', // Disable payment APIs
    'usb=()', // Disable USB
    'accelerometer=()', // Disable accelerometer
    'gyroscope=()', // Disable gyroscope
    'magnetometer=()', // Disable magnetometer
    'display-capture=()', // Disable screen capture
  ].join(', ');

  response.headers.set('Permissions-Policy', permissionsPolicy);

  // HTTPS Enforcement for production
  const url = request.nextUrl.clone();
  const isProduction = process.env.NODE_ENV === 'production';
  const isHTTPS = url.protocol === 'https:';
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // Redirect HTTP to HTTPS in production (but not for localhost)
  if (isProduction && !isHTTPS && !isLocalhost) {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Privacy and cookie headers
  response.headers.set('Set-Cookie', 'SameSite=Strict; Secure; HttpOnly');

  return response;
}

// Apply middleware to all routes except static files and API routes that don't need security headers
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};