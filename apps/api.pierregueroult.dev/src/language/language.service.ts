import { Injectable, OnModuleInit } from '@nestjs/common';

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@repo/i18n/locales';
import type { LanguageMessagesStructure } from '@repo/i18n/structure';

@Injectable()
export class LanguageService implements OnModuleInit {
  private messagesMap: Record<Locale, LanguageMessagesStructure> = {} as Record<
    Locale,
    LanguageMessagesStructure
  >;

  async onModuleInit() {
    const loaders: Record<Locale, () => Promise<LanguageMessagesStructure>> = {
      en: () => import('@repo/i18n/messages/en').then((mod) => mod.default),
      fr: () => import('@repo/i18n/messages/fr').then((mod) => mod.default),
    };

    for (const locale of LOCALES) {
      this.messagesMap[locale] = await loaders[locale]();
    }
  }

  getLanguage(locale: Locale): LanguageMessagesStructure {
    const messages = this.messagesMap[locale] ?? this.messagesMap[DEFAULT_LOCALE];
    if (!messages) {
      throw new Error(
        `No messages found for locale: ${locale} or default locale: ${DEFAULT_LOCALE}`,
      );
    }
    return messages;
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
