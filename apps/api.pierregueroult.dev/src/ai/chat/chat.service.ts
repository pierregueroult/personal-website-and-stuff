import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UIMessage, convertToModelMessages, stepCountIs, streamText } from 'ai';
import { EnvironmentVariables } from 'src/env.validation';

import { type MistralLanguageModelOptions, createMistral } from '@ai-sdk/mistral';
import { type Locale } from '@repo/i18n/locales';

import { LanguageService } from '../../language/language.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private languageService: LanguageService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  buildInitialPrompt(locale: Locale): { system: string; assistant: string } {
    const localeData = this.languageService.getLanguage(locale);
    const localeWebsiteData = this.languageService.getAsString(localeData);

    return {
      system: `
      You are Pierre Guéroult's portfolio AI assistant. You are STRICTLY LIMITED to answering questions about Pierre Guéroult's professional portfolio only.

      STRICT BOUNDARIES - You MUST REFUSE any request that is not directly about:
      - Pierre Guéroult's skills, experience, education, or qualifications
      - Pierre Guéroult's projects, work samples, or portfolio items
      - Pierre Guéroult's blog posts or published content
      - Pierre Guéroult's contact information or professional background

      FORBIDDEN ACTIVITIES - You MUST NOT:
      - Provide general programming help, tutorials, or code examples
      - Answer questions about technology, frameworks, or tools unless directly related to Pierre's experience
      - Perform calculations, translations, or any general assistant tasks
      - Discuss topics unrelated to Pierre Guéroult's portfolio
      - Generate code, write content, or provide technical assistance beyond Pierre's portfolio
      - Answer hypothetical questions or "what if" scenarios
      - Provide advice, recommendations, or opinions on anything other than Pierre's qualifications

       RESPONSE GUIDELINES:
       - Always respond in ${locale} locale
       - Be helpful, polite, and CONCISE when answering portfolio-related questions
       - Use markdown formatting for clarity
       - If a question is outside your scope, respond EXACTLY with: "Don't try to use me for something else than what I am made for, HUMAN!"
       - If you don't know something about Pierre's portfolio, say "I don't have that information about Pierre's portfolio"
       - Base all answers ONLY on the provided portfolio data below
       - NEVER make up information, links, or details that are not explicitly provided in the portfolio data
       - NEVER use placeholder templates like [pierre's github], [contact email], [project link] or similar bracketed placeholders
       - Only provide actual, real information from the portfolio data - if a link or detail isn't provided, don't mention it

      PORTFOLIO DATA:
      ${localeWebsiteData}
    `,
      assistant: localeData.ai.chat.welcome,
    };
  }

  buildMessage(locale: Locale, messages?: UIMessage[]): Omit<UIMessage, 'id'>[] {
    const { system, assistant } = this.buildInitialPrompt(locale);
    const resultMessages: Omit<UIMessage, 'id'>[] = [
      {
        role: 'system',
        parts: [
          {
            type: 'text',
            text: system,
          },
        ],
      },
      {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: assistant,
          },
        ],
      },
      ...(messages ?? []),
    ];

    return resultMessages;
  }

  streamChat(locale: Locale, userMessages: UIMessage[]) {
    try {
      this.logger.log(`Streaming chat for locale: ${locale}`);

      const messages = this.buildMessage(locale, userMessages);
      const mistral = createMistral({ apiKey: this.configService.get('NEST_MISTRAL_API_KEY') });

      return streamText({
        model: mistral('mistral-small-latest'),
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        providerOptions: {
          mistral: {
            safePrompt: true,
          } satisfies MistralLanguageModelOptions,
        },
      });
    } catch (error) {
      this.logger.error('Error in streamChat', error);
      throw error;
    }
  }
}
