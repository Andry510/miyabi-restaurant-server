import { Logger as LoggerNest } from '@nestjs/common';

export class Logger {
  private readonly logger: LoggerNest;

  constructor(context: string) {
    this.logger = new LoggerNest(context);
  }

  info(message: unknown): void {
    this.logger.log(message);
  }

  error(message: unknown, trace?: string): void {
    if (trace) {
      this.logger.error(message, trace);
      return;
    }

    this.logger.error(message);
  }

  warn(message: unknown, trace?: string): void {
    if (trace) {
      this.logger.warn(message, trace);
      return;
    }

    this.logger.warn(message);
  }
}
