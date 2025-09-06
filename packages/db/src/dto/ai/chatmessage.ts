import { UIMessage } from 'ai';
import { IsIn, IsString } from 'class-validator';

import { LOCALES, type Locale } from '@repo/i18n/locales';

import { IsValidUiMessageArray } from '../../decorator/ui-message';

export class ChatMessageDto {
  @IsString()
  @IsIn(LOCALES)
  locale: Locale;

  @IsValidUiMessageArray()
  messages: UIMessage[];
}
