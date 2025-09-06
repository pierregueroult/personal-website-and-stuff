import { Injectable } from '@nestjs/common';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@repo/i18n/locales';
import type { LanguageMessagesStructure } from '@repo/i18n/structure';

@Injectable()
export class LanguageService {
  messagesMap: Record<Locale, () => Promise<LanguageMessagesStructure>> = {
    en: () => import('@repo/i18n/messages/en').then((mod) => mod.default),
    fr: () => import('@repo/i18n/messages/fr').then((mod) => mod.default),
  };

  async getLanguage(locale: Locale): Promise<LanguageMessagesStructure> {
    const loader = this.messagesMap[locale] ?? this.messagesMap[DEFAULT_LOCALE];
    if (!loader) {
      throw new Error(
        `No messages loader found for locale: ${locale} or default locale: ${DEFAULT_LOCALE}`,
      );
    }
    return loader();
  }

  getAvailableLanguages() {
    return LOCALES;
  }

  getDefaultLanguage() {
    return DEFAULT_LOCALE;
  }

  getAsString(data: LanguageMessagesStructure): string {
    return JSON.stringify(data);
  }
}
