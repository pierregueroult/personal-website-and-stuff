import { c15tInstance } from '@c15t/backend/v2';
import { mongoAdapter } from '@c15t/backend/v2/db/adapters/mongo';

import { MongoClient } from 'mongodb';

import { env } from '@/lib/env/server';

const client = new MongoClient(env.NEXT_MONGO_URI);

const cookieConsent = c15tInstance({
  appName: 'personal-website',
  basePath: '/api/cookies',
  adapter: mongoAdapter({ client }),
  trustedOrigins: [
    'localhost',
    'pierregueroult.dev',
    'www.pierregueroult.dev',
    'api.pierregueroult.dev',
  ],
  logger: {
    level: 'warn',
  },
  advanced: {
    telemetry: {
      disabled: true,
    },
  },
});

const handleRequest = async (request: Request) => cookieConsent.handler(request);
export const runtime = 'nodejs';

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };
