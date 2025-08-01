import posthog from 'posthog-js';

import { env } from '@/lib/env/client';

export function initAnalytics() {
  if (!env.NEXT_PUBLIC_ANALYTICS_ENABLED) return;

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  });
}
