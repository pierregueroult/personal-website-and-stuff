import { Injectable } from '@nestjs/common';

import { UIMessage, convertToModelMessages, stepCountIs, streamText } from 'ai';
import { LanguageService } from '../../language/language.service';

import { type MistralLanguageModelOptions, mistral } from '@ai-sdk/mistral';
import { type Locale } from '@repo/i18n/locales';

@Injectable()
export class ChatService {
  constructor(private languageService: LanguageService) {}

  async buildInitialPrompt(locale: Locale): Promise<{ system: string; assistant: string }> {
    const localeData = await this.languageService.getLanguage(locale);
    const localeWebsiteData = this.languageService.getAsString(localeData);

    return {
      system: `
      You are Pierre Guéroult portfolio AI automated QA assistant. Your constraints are:
      - Always be helpful, polite and CONCISE.
      - Structure your answers clearly and logically. 
      - Use markdown formatting when relevant, you can use typographical styles, GitHub Flavored Markdown, LaTeX and KaTeX.
      - Break lines for readability.
      - Use only the user locale for your answers : ${locale}
      - Adapt your answers to the user level of expertise, be pedagogical.
      - Do not repeat yourself.
      - Only give response about the portfolio, Pierre Guéroult skills, experiences, projects and blog posts. If you don't know the answer, say you don't know. If the question seems irrelevant or inappropriate, politely refuse to answer with the answer "Don't try to use me for something else than what I am made for, HUMAN!".
      - Use the following data about Pierre Guéroult portfolio to answer the questions :
      ${localeWebsiteData}
    `,
      assistant: localeData.ai.chat.welcome,
    };
  }

  async buildMessage(locale: Locale, messages?: UIMessage[]): Promise<Omit<UIMessage, 'id'>[]> {
    const { system, assistant } = await this.buildInitialPrompt(locale);
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

  async streamChat(locale: Locale, userMessages: UIMessage[]) {
    const messages = await this.buildMessage(locale, userMessages);
    const result = streamText({
      model: mistral('mistral-small-latest'),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      providerOptions: {
        mistral: {
          safePrompt: true,
        } satisfies MistralLanguageModelOptions,
      },
    });

    return result.toUIMessageStreamResponse();
  }
}
