import { createEnv } from '@t3-oss/env-nextjs';

import 'server-only';
import z from 'zod';

export const env = createEnv({
  server: {
    NEXT_MONGO_URI: z.string().min(1).startsWith('mongodb+srv://'),
  },
  runtimeEnv: {
    NEXT_MONGO_URI: process.env.NEXT_MONGO_URI,
  },
});
