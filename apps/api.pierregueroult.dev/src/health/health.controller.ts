import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { EnvironmentVariables } from '../env.validation';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthCheckService,
    private readonly httpIndicator: HttpHealthIndicator,
    private readonly databaseIndicator: TypeOrmHealthIndicator,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly diskIndicator: DiskHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
  ) {}

  @Get('all')
  @HealthCheck()
  check() {
    return this.healthService.check([
      async () =>
        this.httpIndicator.pingCheck(
          'frontend deployment',
          this.configService.get('NEST_FRONTEND_URL'),
        ),
      async () =>
        this.httpIndicator.pingCheck(
          'backend deployment',
          this.configService.get('NEST_BACKEND_URL'),
        ),
      async () =>
        this.httpIndicator.pingCheck('host deployment', this.configService.get('NEST_HOST_URL')),
      async () =>
        this.httpIndicator.pingCheck(
          'email service',
          `https://${this.configService.get('NEST_MAILER_HOST')}`,
        ),
      async () => this.databaseIndicator.pingCheck('database'),
      async () =>
        this.diskIndicator.checkStorage('storage', {
          thresholdPercent: 0.5,
          path: '/',
        }),
      async () => this.memoryIndicator.checkHeap('memory heap', 150 * 1024 * 1024),
    ]);
  }
}
