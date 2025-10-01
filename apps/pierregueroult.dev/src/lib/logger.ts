/**
 * Logger utility that mimics NestJS Logger interface for frontend consistency
 */
export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(
    level: 'log' | 'error' | 'warn',
    message: string,
    optionalParams?: unknown[],
  ): void {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    const formattedMessage = `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`;

    if (optionalParams && optionalParams.length > 0) {
      console[level](formattedMessage, ...optionalParams);
    } else {
      console[level](formattedMessage);
    }
  }

  log(message: string, ...optionalParams: unknown[]): void {
    this.formatMessage('log', message, optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    this.formatMessage('error', message, optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.formatMessage('warn', message, optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      this.formatMessage('log', message, optionalParams);
    }
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      this.formatMessage('log', message, optionalParams);
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
