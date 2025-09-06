import { DEFAULT_LOCALE, LOCALES } from '@repo/i18n/locales';

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});
