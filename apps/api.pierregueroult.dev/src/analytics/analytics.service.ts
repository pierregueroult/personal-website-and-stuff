import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';

import { PostHog } from 'posthog-node';

import { POSTHOG_OPTIONS } from './analytics.constants';
import type {
  PosthogAliasProps,
  PosthogCaptureProps,
  PosthogGroupIdentifyProps,
  PosthogIdentifyProps,
  PosthogModuleOptions,
} from './analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly client: PostHog;
  private readonly mock: boolean;
  private logger: Logger = new Logger(AnalyticsService.name);

  constructor(@Inject(POSTHOG_OPTIONS) private readonly options: PosthogModuleOptions) {
    this.client = new PostHog(options.apiKey, options.options);
    this.mock = options.mock ?? false;
  }

  capture(props: PosthogCaptureProps): void {
    if (!this.mock) this.client.capture(props);
    else this.logger.log(`Mock capture: ${JSON.stringify(props)}`);
  }

  identify(props: PosthogIdentifyProps): void {
    if (!this.mock) this.client.identify(props);
    else this.logger.log(`Mock identify: ${JSON.stringify(props)}`);
  }

  groupIdentify(props: PosthogGroupIdentifyProps): void {
    if (!this.mock) this.client.groupIdentify(props);
    else this.logger.log(`Mock groupIdentify: ${JSON.stringify(props)}`);
  }

  alias(props: PosthogAliasProps): void {
    if (!this.mock) this.client.alias(props);
    else this.logger.log(`Mock alias: ${JSON.stringify(props)}`);
  }

  shutdown() {
    void this.client.shutdown();
  }
}
