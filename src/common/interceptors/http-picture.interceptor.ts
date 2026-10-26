import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Observable } from 'rxjs';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ServiceErrorFactory } from '@domain/patterns/errors';

//Infrastructure
import { HttpErrorMapper } from '@infrastructure/mappers/shared';

const PICTURE_MAX_BYTES = 6 * 1024 * 1024;

const PictureFileInterceptor = FileInterceptor('picture', {
  limits: { fileSize: PICTURE_MAX_BYTES, files: 1 },
});

@Injectable()
export class HttpPictureInterceptor implements NestInterceptor {
  private readonly file = new PictureFileInterceptor();

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    try {
      return await this.file.intercept(context, next);
    } catch (error) {
      throw HttpErrorMapper.toException(this.toServiceError(error));
    }
  }

  private toServiceError(error: unknown): ServiceError {
    if (error instanceof PayloadTooLargeException) {
      return ServiceErrorFactory.PayloadTooLarge(
        API_MESSAGE_GLOBAL.ERROR.PICTURE_TOO_LARGE,
      );
    }

    return ServiceErrorFactory.BadRequest(API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST);
  }
}
