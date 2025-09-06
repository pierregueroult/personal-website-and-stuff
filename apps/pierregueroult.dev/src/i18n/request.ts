import type { Locale } from '@repo/i18n/locales';
import type { LanguageMessagesStructure } from '@repo/i18n/structure';

import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from '@/i18n/routing';

const messagesMap: Record<Locale, () => Promise<LanguageMessagesStructure>> = {
  en: () => import('@repo/i18n/messages/en').then((mod) => mod.default),
  fr: () => import('@repo/i18n/messages/fr').then((mod) => mod.default),
};

async function getMessages(locale: Locale): Promise<LanguageMessagesStructure> {
  const loader = messagesMap[locale] ?? messagesMap[routing.defaultLocale];
  if (!loader) {
    throw new Error(
      `No messages loader found for locale: ${locale} or default locale: ${routing.defaultLocale}`,
    );
  }
  return loader();
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages = await getMessages(locale);
  return {
    locale,
    messages,
  };
});
