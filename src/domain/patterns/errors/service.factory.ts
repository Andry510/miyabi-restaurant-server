//Domain
import { ServiceError } from '@domain/errors';
import type { TApiMessage, TServiceErrorCode } from '@domain/types/shared';

export class ServiceErrorFactory {
  private static create = (
    code: TServiceErrorCode,
    message: TApiMessage,
  ): ServiceError => new ServiceError(code, message);

  static BadRequest = (message: TApiMessage): ServiceError =>
    this.create('BAD_REQUEST', message);

  static Unauthorized = (message: TApiMessage): ServiceError =>
    this.create('UNAUTHORIZED', message);

  static Forbidden = (message: TApiMessage): ServiceError =>
    this.create('FORBIDDEN', message);

  static NotFound = (message: TApiMessage): ServiceError =>
    this.create('NOT_FOUND', message);

  static Conflict = (message: TApiMessage): ServiceError =>
    this.create('CONFLICT', message);

  static PayloadTooLarge = (message: TApiMessage): ServiceError =>
    this.create('PAYLOAD_TOO_LARGE', message);

  static InternalServer = (message: TApiMessage): ServiceError =>
    this.create('INTERNAL', message);
}
