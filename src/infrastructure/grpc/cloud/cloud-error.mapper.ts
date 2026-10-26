//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { ServiceError } from '@domain/errors';
import type { TServiceErrorCode } from '@domain/types/shared';

//Infrastructure
import { GrpcState } from '@infrastructure/constants';

const CODE_BY_STATE: Partial<Record<number, TServiceErrorCode>> = {
  [GrpcState.INVALID_ARGUMENT]: 'BAD_REQUEST',
  [GrpcState.OUT_OF_RANGE]: 'BAD_REQUEST',
  [GrpcState.UNAUTHENTICATED]: 'UNAUTHORIZED',
  [GrpcState.PERMISSION_DENIED]: 'FORBIDDEN',
  [GrpcState.NOT_FOUND]: 'NOT_FOUND',
  [GrpcState.ALREADY_EXISTS]: 'CONFLICT',
  [GrpcState.ABORTED]: 'CONFLICT',
  [GrpcState.FAILED_PRECONDITION]: 'CONFLICT',
  [GrpcState.RESOURCE_EXHAUSTED]: 'PAYLOAD_TOO_LARGE',
  [GrpcState.UNAVAILABLE]: 'UNAVAILABLE',
  [GrpcState.DEADLINE_EXCEEDED]: 'UNAVAILABLE',
};

const isServiceError = (
  error: unknown,
): error is { code: number; details?: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'number';

export class CloudErrorMapper {
  static toServiceError(error: unknown): ServiceError {
    const code = isServiceError(error) ? CODE_BY_STATE[error.code] : undefined;

    if (!code) {
      return new ServiceError(
        'INTERNAL',
        API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
      );
    }

    if (code === 'UNAVAILABLE') {
      return new ServiceError(code, API_MESSAGE_GLOBAL.ERROR.CLOUD_UNAVAILABLE);
    }

    return new ServiceError(
      code,
      (error as { details?: string }).details ||
        API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
    );
  }
}
