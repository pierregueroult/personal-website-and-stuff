import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { env } from '../env/server';
import { COOKIE_MAX_AGE, COOKIE_MIRROR, COOKIE_NAME } from './constants';

export function createContentMiddleware() {
  return function middleware(req: NextRequest): NextResponse {
    const res = NextResponse.next();

    console.log('MIDDLEWARE', req.url);

    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    let anonId: string | null = null;

    if (cookie) {
      const id = verify(cookie);
      if (id) anonId = id;
    }

    if (!anonId) {
      anonId = generate();
      const signed = sign(anonId);

      res.cookies.set({
        name: COOKIE_NAME,
        value: signed,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      res.cookies.set({
        name: COOKIE_MIRROR,
        value: anonId,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
    } else {
      res.cookies.set({
        name: COOKIE_MIRROR,
        value: anonId,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return res;
  };
}

function verify(signed: string): string | null {
  const [id, sig] = signed.split('.');
  if (!id || !sig) return null;
  const expected = crypto
    .createHmac('sha256', env.NEXT_CONTENT_COOKIE_SECRET)
    .update(id)
    .digest('hex');
  return expected === sig ? id : null;
}

function sign(id: string): string {
  const h = crypto.createHmac('sha256', env.NEXT_CONTENT_COOKIE_SECRET).update(id).digest('hex');
  return `${id}.${h}`;
}

function generate(): string {
  return crypto.randomUUID();
}
