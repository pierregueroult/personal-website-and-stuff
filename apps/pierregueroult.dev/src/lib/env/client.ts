import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://eu.i.posthog.com'),
    NEXT_PUBLIC_ANALYTICS_ENABLED: z.boolean().default(false),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
  },
});
