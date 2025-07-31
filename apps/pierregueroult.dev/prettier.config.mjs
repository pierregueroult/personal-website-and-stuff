import { config as nextConfig } from '@repo/prettier-config/next-js';

export default { ...nextConfig, tailwindStylesheet: '@repo/ui/styles/globals.css' };
