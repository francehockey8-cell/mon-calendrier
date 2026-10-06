import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'cal_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(COOKIE)?.value;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isPublic = isAuthPage || pathname.startsWith('/_next') || pathname.startsWith('/api');

  if (isPublic) {
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};