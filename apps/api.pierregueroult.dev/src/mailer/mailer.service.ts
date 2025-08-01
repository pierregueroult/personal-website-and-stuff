import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailerPackage } from '@repo/email';

import { EnvironmentVariables } from '../env.validation';

@Injectable()
export class MailerService {
  private readonly mailerPackage: MailerPackage;

  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.configService.set('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    }

    this.mailerPackage = new MailerPackage({
      options: {
        host: this.configService.get('NEST_MAILER_HOST'),
        port: this.configService.get('NEST_MAILER_PORT'),
        secure: this.configService.get('NEST_MAILER_PORT') === 465,
        auth: {
          user: this.configService.get('NEST_MAILER_USER'),
          pass: this.configService.get('NEST_MAILER_PASS'),
        },
      },
      from: this.configService.get('NEST_MAILER_FROM'),
    });
  }
}
