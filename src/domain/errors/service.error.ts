//Domain
import type { TApiMessage, TServiceErrorCode } from '@domain/types/shared';

export class ServiceError {
  readonly code: TServiceErrorCode;
  readonly message: string;
  readonly message_code: string;
  readonly timestamp: string;

  constructor(code: TServiceErrorCode, message: TApiMessage) {
    this.code = code;
    this.message = message.message;
    this.message_code = message.code;
    this.timestamp = new Date().toISOString();
  }
}
