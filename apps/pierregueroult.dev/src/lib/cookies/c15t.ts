import { getMongoClient } from '@/lib/database/mongo';

let c15tCookieConsent: any = null;

export async function getC15tCookieConsent() {
  if (!c15tCookieConsent) {
    const [{ c15tInstance }, { mongoAdapter }] = await Promise.all([
      import('@c15t/backend/v2'),
      import('@c15t/backend/v2/db/adapters/mongo'),
    ]);
    const client = await getMongoClient();
    c15tCookieConsent = c15tInstance({
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
  }
  return c15tCookieConsent;
}