import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

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

  @Matches(/https?:\/\//)
  NEST_CORS_ORIGIN: string;

  @Matches(/mongodb\+srv:\/\//)
  NEST_DATABASE_URL: string;

  @IsString()
  NEST_TWITCH_CLIENT_ID: string;

  @IsString()
  NEST_TWITCH_CLIENT_SECRET: string;

  @IsString()
  NEST_TWITCH_REDIRECT_URI: string;

  @IsString()
  NEST_TWITCH_USERNAME: string;

  @IsString()
  NEST_TWITCH_CHANNEL: string;

  @IsString()
  NEST_JWT_SECRET: string;

  @IsNumber()
  @Min(0)
  @Max(7 * 24 * 60 * 60)
  NEST_JWT_EXPIRATION_TIME: number;

  @IsString()
  NEST_GITHUB_CALLBACK_URL: string;

  @IsString()
  NEST_GITHUB_CLIENT_ID: string;

  @IsString()
  NEST_GITHUB_CLIENT_SECRET: string;

  @IsString()
  NEST_POSTHOG_API_KEY: string;

  @IsString()
  NEST_POSTHOG_HOST: string;
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
