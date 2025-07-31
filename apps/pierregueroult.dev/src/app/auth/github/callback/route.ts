import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=github_auth_failed', request.url),
    );
  }

  const cookieStore = await cookies();

  cookieStore.set('auth-token', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'lax',
  });

  return NextResponse.redirect(new URL('/app', request.url));
}