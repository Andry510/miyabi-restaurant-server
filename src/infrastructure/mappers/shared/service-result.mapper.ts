//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type {
  TApiMessage,
  TPaginationFormant,
  TPaginationService,
} from '@domain/types/shared';
import { ServiceErrorFactory } from '@domain/patterns/errors';
import { ResultPattern } from '@domain/patterns/results';

export class ServiceResultMapper {
  static success<T>(value: T): ResultPattern<T, ServiceError> {
    return ResultPattern.Success(value);
  }

  static Ok<T>(value: T): ResultPattern<T, ServiceError> {
    return this.success<T>(value);
  }

  static Pagination<T>(
    data: T[],
    page: number,
    limit: number,
    count: number,
  ): ResultPattern<TPaginationService<T>, ServiceError> {
    const metadata: TPaginationFormant = {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit),
      next_page: page * limit < count,
      prev_page: page > 1,
    };

    return this.success<TPaginationService<T>>({ data, metadata });
  }

  static BadRequest<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.BadRequest(message));
  }

  static Forbidden<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.FORBIDDEN,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.Forbidden(message));
  }

  static NotFound<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.NOT_FOUND,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.NotFound(message));
  }

  static Conflict<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.CONFLICT,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.Conflict(message));
  }

  static InternalServerError<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.InternalServer(message));
  }

  static Unauthorized<T>(
    message: TApiMessage = API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
  ): ResultPattern<T, ServiceError> {
    return ResultPattern.Failure(ServiceErrorFactory.Unauthorized(message));
  }
}
