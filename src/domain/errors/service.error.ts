//Domain
import type { TServiceErrorCode } from '@domain/types/shared';

export class ServiceError {
  readonly code: TServiceErrorCode;
  readonly message: string;
  readonly timestamp: string;

  constructor(code: TServiceErrorCode, message: string) {
    this.code = code;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
