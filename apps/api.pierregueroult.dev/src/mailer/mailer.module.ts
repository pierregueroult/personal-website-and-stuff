import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailerService } from './mailer.service';

@Module({
  imports: [ConfigModule],
  providers: [MailerService],
})
export class MailerModule {}
