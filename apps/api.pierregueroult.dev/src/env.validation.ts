import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsUrl, Matches, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  NEST_PORT: number;

  @IsUrl()
  @Matches(/https?:\/\//)
  NEST_CORS_ORIGIN: string;

  @IsUrl()
  @Matches(/mongodb+src:\/\//)
  NEST_DATABASE_URL: string;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validateConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validateConfig;
}
