//Domain
import { ServiceError } from '@domain/errors';
import type { TServiceErrorCode } from '@domain/types/shared';

export class ServiceErrorFactory {
  private static create = (
    code: TServiceErrorCode,
    message: string,
  ): ServiceError => new ServiceError(code, message);

  static BadRequest = (message: string): ServiceError =>
    this.create('BAD_REQUEST', message);

  static Unauthorized = (message: string): ServiceError =>
    this.create('UNAUTHORIZED', message);

  static Forbidden = (message: string): ServiceError =>
    this.create('FORBIDDEN', message);

  static NotFound = (message: string): ServiceError =>
    this.create('NOT_FOUND', message);

  static Conflict = (message: string): ServiceError =>
    this.create('CONFLICT', message);

  static PayloadTooLarge = (message: string): ServiceError =>
    this.create('PAYLOAD_TOO_LARGE', message);

  static InternalServer = (message: string): ServiceError =>
    this.create('INTERNAL', message);
}
