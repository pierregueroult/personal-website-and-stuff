import type { EventMessage, GroupIdentifyMessage, IdentifyMessage, PostHogOptions } from 'posthog-node';

export interface PosthogModuleOptions {
  apiKey: string;
  options?: PostHogOptions;
  enabled?: boolean;
}

export interface PosthogModuleAsyncOptions {
  useFactory: (...args: any[]) => PosthogModuleOptions | Promise<PosthogModuleOptions>;
  inject?: any[];
  imports?: any[];
}

export interface PosthogCaptureProps extends EventMessage {}

export interface PosthogIdentifyProps extends IdentifyMessage {}

export interface PosthogGroupIdentifyProps extends GroupIdentifyMessage {}

export interface PosthogAliasProps {
  distinctId: string;
  alias: string;
  disableGeoip?: boolean;
}
