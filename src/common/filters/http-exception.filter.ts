import type { Response } from 'express';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { TApiMessage } from '@domain/types/shared';

//Infrastructure
import { Logger } from '@infrastructure/audits';

const MESSAGE_BY_STATUS: Partial<Record<number, TApiMessage>> = {
  [HttpStatus.BAD_REQUEST]: API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: API_MESSAGE_GLOBAL.ERROR.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: API_MESSAGE_GLOBAL.ERROR.NOT_FOUND,
  [HttpStatus.METHOD_NOT_ALLOWED]: API_MESSAGE_GLOBAL.ERROR.METHOD_NOT_ALLOWED,
  [HttpStatus.CONFLICT]: API_MESSAGE_GLOBAL.ERROR.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: API_MESSAGE_GLOBAL.ERROR.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: API_MESSAGE_GLOBAL.ERROR.TOO_MANY_REQUESTS,
  [HttpStatus.SERVICE_UNAVAILABLE]:
    API_MESSAGE_GLOBAL.ERROR.SERVICE_UNAVAILABLE,
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      this.reply(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
      );
      return;
    }

    const status = exception.getStatus();
    const body = exception.getResponse();

    if (typeof body === 'object' && 'code' in body) {
      response.status(status).json(body);
      return;
    }

    this.reply(
      response,
      status,
      MESSAGE_BY_STATUS[status] ??
        (status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR
          : API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST),
    );
  }

  private reply(
    response: Response,
    status: number,
    { code, message }: TApiMessage,
  ): void {
    response.status(status).json({
      status_code: status,
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
