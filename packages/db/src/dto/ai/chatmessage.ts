import { UIMessage } from 'ai';
import { Equals, IsIn, IsString } from 'class-validator';

import { LOCALES, type Locale } from '@repo/i18n/locales';

import { IsValidUiMessageArray } from '../../decorator/ui-message';

export class ChatMessageDto {
  @IsString()
  @IsIn(LOCALES)
  locale: Locale;

  @IsValidUiMessageArray()
  messages: UIMessage[];

  @IsString()
  id: string;

  @IsString()
  @Equals('submit-message')
  trigger: string;
}
