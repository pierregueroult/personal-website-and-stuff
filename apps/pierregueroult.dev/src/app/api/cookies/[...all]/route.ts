import type { NextRequest } from 'next/server';

import { getC15tCookieConsent } from '@/lib/cookies/c15t';

export const runtime = 'nodejs';

async function handleRequest(request: NextRequest) {
  const cookieConsent = await getC15tCookieConsent();
  return cookieConsent.handler(request);
}

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };
