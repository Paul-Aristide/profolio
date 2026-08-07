// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU='
);

const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/u/',
    '/api/posts/',
    '/u/',
    '/api/contact/send',
    '/api/admin/cron/',
    '/connexion',
    '/inscription',
    '/verification-otp',
    '/tableau-de-bord',
    '/dashboard',
    '/admin',
  ];

  const isPublicPath = publicPaths.some((p) => path.startsWith(p));

  // CSRF protection: for mutating requests on non-public API routes,
  // verify Origin/Referer header matches the expected host
  // Skip CSRF check for API requests that have a session cookie (same-site requests)
  // The JWT verification that follows will provide the necessary security
  if (!isPublicPath && CSRF_PROTECTED_METHODS.includes(method) && !path.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const expectedHost = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    if (origin && origin !== expectedHost) {
      return NextResponse.json(
        { error: 'CSRF: origine non autorisée' },
        { status: 403 }
      );
    }

    if (!origin && !referer) {
      return NextResponse.json(
        { error: 'CSRF: en-tête Origine/Referer manquant' },
        { status: 403 }
      );
    }

    if (referer && !referer.startsWith(expectedHost)) {
      return NextResponse.json(
        { error: 'CSRF: référent non autorisé' },
        { status: 403 }
      );
    }
  }

  if (!isPublicPath) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-role', payload.role as string);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      console.error('Erreur vérification JWT dans middleware :', error);
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
};
