import { Injectable, Inject } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { POSTHOG_OPTIONS } from './analytics.constants';
import type {
  PosthogModuleOptions,
  PosthogAliasProps,
  PosthogCaptureProps,
  PosthogGroupIdentifyProps,
  PosthogIdentifyProps,
} from './analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly client: PostHog | null;

  constructor(@Inject(POSTHOG_OPTIONS) private readonly options: PosthogModuleOptions) {
    if (!options.enabled) this.client = null;
    else this.client = new PostHog(options.apiKey, options.options);
  }

  capture(props: PosthogCaptureProps): void {
    if (!this.client) return;
    this.client.capture(props);
  }

  identify(props: PosthogIdentifyProps): void {
    if (!this.client) return;
    this.client.identify(props);
  }

  groupIdentify(props: PosthogGroupIdentifyProps): void {
    if (!this.client) return;
    this.client.groupIdentify(props);
  }

  alias(props: PosthogAliasProps): void {
    if (!this.client) return;
    this.client.alias(props);
  }

  shutdown() {
    if (!this.client) return;
    void this.client.shutdown();
  }

  isEnabled(): boolean {
    return !!this.client;
  }
}
