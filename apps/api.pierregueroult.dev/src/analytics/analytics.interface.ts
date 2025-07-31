import type { EventMessage, GroupIdentifyMessage, IdentifyMessage, PostHogOptions } from 'posthog-node';

export interface PosthogModuleOptions {
  apiKey: string;
  mock?: boolean;
  options?: PostHogOptions;
}

export interface PosthogModuleAsyncOptions {
  useFactory: (...args: any[]) => PosthogModuleOptions | Promise<PosthogModuleOptions>;
  inject?: any[];
  imports?: any[];
}

export type PosthogCaptureProps = EventMessage

export type PosthogIdentifyProps = IdentifyMessage

export type PosthogGroupIdentifyProps = GroupIdentifyMessage

export interface PosthogAliasProps {
  distinctId: string;
  alias: string;
  disableGeoip?: boolean;
}
