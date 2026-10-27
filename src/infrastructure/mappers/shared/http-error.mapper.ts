import { HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

//Domain
import type { ServiceError } from '@domain/errors';
import type { TMessageResponse, TServiceErrorCode } from '@domain/types/shared';

const STATUS_BY_CODE: Record<TServiceErrorCode, HttpStatus> = {
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  PAYLOAD_TOO_LARGE: HttpStatus.PAYLOAD_TOO_LARGE,
  UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
};

type THttpErrorBody = TMessageResponse & { status_code: HttpStatus };

export class HttpErrorMapper {
  static toStatus = (code: TServiceErrorCode): HttpStatus =>
    STATUS_BY_CODE[code];

  static toBody = (error: ServiceError): THttpErrorBody => ({
    status_code: HttpErrorMapper.toStatus(error.code),
    code: error.message_code,
    message: error.message,
    timestamp: error.timestamp,
  });

  static reply = (response: Response, error: ServiceError): Response => {
    const body = HttpErrorMapper.toBody(error);

    return response.status(body.status_code).json(body);
  };

  static toException = (error: ServiceError): HttpException => {
    const body = HttpErrorMapper.toBody(error);

    return new HttpException(body, body.status_code);
  };
}
