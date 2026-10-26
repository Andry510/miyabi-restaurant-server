//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import type { TErrorLayer } from '@domain/types/config';
import type { DomainErrorFactory } from '../errors';
import type { TAsyncFunction, TFunction } from '@domain/types/shared';

//Infrastructure
import { ErrorFactoryMapper } from '@infrastructure/mappers/shared';

export class ResultPattern<T, E = DomainErrorFactory> {
  private readonly is_success: boolean;
  private readonly value: T | null;
  private readonly error: E | null;

  private constructor(
    is_success: boolean,
    value: T | null,
    error: E | null = null,
  ) {
    this.is_success = is_success;
    this.value = value;
    this.error = error;
  }

  get IsSuccess(): boolean {
    return this.is_success;
  }

  get IsFailure(): boolean {
    return !this.IsSuccess;
  }

  get Value(): T {
    if (!this.IsSuccess) {
      throw new Error(SYSTEM_MESSAGE.ERROR.INVALID_RESULT_ENTITIES);
    }

    return this.value as T;
  }

  get Error(): E {
    return this.error as E;
  }

  static Success = <T, E = never>(value: T): ResultPattern<T, E> =>
    new ResultPattern<T, E>(true, value);

  static Failure = <E, T = never>(error: E): ResultPattern<T, E> =>
    new ResultPattern<T, E>(false, null, error);

  static tryCatch = <T, E>(
    layer: TErrorLayer,
    origin: string,
    fn: TFunction<T>,
  ): ResultPattern<T> => {
    try {
      const result = fn();
      return ResultPattern.Success(result);
    } catch (err) {
      return ResultPattern.Failure(
        ErrorFactoryMapper.toDomainError(err as E, layer, origin),
      );
    }
  };

  static tryCatchAsync = async <T>(
    layer: TErrorLayer,
    origin: string,
    fn: TAsyncFunction<T>,
  ): Promise<ResultPattern<T>> => {
    try {
      const result = await fn();
      return ResultPattern.Success(result);
    } catch (err) {
      return ResultPattern.Failure(
        ErrorFactoryMapper.toDomainError(err, layer, origin),
      );
    }
  };
}
