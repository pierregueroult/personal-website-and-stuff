import createMiddleware from 'next-intl/middleware';
import { type NextMiddleware, type NextRequest, NextResponse } from 'next/server';

import { routing } from '@/i18n/routing';
import { createContentMiddleware } from '@/lib/content-based/middleware';

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

const composeMiddlewares = (middlewares: {
  [key: string]: (req: NextRequest) => NextResponse | Promise<NextResponse>;
}) => {
  return (req: NextRequest) => {
    const parsedMiddlewares = Object.entries(middlewares);
    const initialResponse = Promise.resolve(NextResponse.next());

    return parsedMiddlewares.reduce(async (prevPromise, [, middleware]) => {
      return prevPromise.then((res) => {
        return res?.status >= 300 && res?.status < 400 ? res : middleware(req);
      });
    }, initialResponse);
  };
};

export const middleware = composeMiddlewares({
  contentMiddleware: createContentMiddleware(),
  i18nMiddleware: createMiddleware(routing),
});

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  runtime: 'nodejs',
};
