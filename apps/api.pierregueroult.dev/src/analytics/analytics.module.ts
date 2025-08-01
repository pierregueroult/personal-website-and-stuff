import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { POSTHOG_OPTIONS } from './analytics.constants';
import { PosthogModuleAsyncOptions, PosthogModuleOptions } from './analytics.interface';
import { AnalyticsService } from './analytics.service';

@Global()
@Module({})
export class AnalyticsModule {
  static forRoot(options: PosthogModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: POSTHOG_OPTIONS,
      useValue: options,
    };

    return {
      module: AnalyticsModule,
      providers: [optionsProvider, AnalyticsService],
      exports: [AnalyticsService],
    };
  }

  static forRootAsync(options: PosthogModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: POSTHOG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: AnalyticsModule,
      imports: options.imports || [],
      providers: [optionsProvider, AnalyticsService],
      exports: [AnalyticsService],
    };
  }
}
