import type { Metadata } from '@grpc/grpc-js';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { ServiceError } from '@domain/errors';
import type { TApiMessage, TServiceErrorCode } from '@domain/types/shared';

//Infrastructure
import { GrpcState } from '@infrastructure/constants';

const GRPC_ERROR_CODE_KEY = 'code';

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

const MESSAGE_BY_CODE: Record<TServiceErrorCode, TApiMessage> = {
  BAD_REQUEST: API_MESSAGE_GLOBAL.ERROR.BAD_REQUEST,
  UNAUTHORIZED: API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
  FORBIDDEN: API_MESSAGE_GLOBAL.ERROR.FORBIDDEN,
  NOT_FOUND: API_MESSAGE_GLOBAL.ERROR.NOT_FOUND,
  CONFLICT: API_MESSAGE_GLOBAL.ERROR.CONFLICT,
  PAYLOAD_TOO_LARGE: API_MESSAGE_GLOBAL.ERROR.PICTURE_TOO_LARGE,
  UNAVAILABLE: API_MESSAGE_GLOBAL.ERROR.CLOUD_UNAVAILABLE,
  INTERNAL: API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
};

const isServiceError = (
  error: unknown,
): error is { code: number; details?: string; metadata?: Metadata } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof error.code === 'number';

export class CloudErrorMapper {
  static toServiceError(error: unknown): ServiceError {
    const code = isServiceError(error) ? CODE_BY_STATE[error.code] : undefined;

    if (!code || !isServiceError(error)) {
      return new ServiceError(
        'INTERNAL',
        API_MESSAGE_GLOBAL.ERROR.INTERNAL_ERROR,
      );
    }

    if (code === 'UNAVAILABLE') {
      return new ServiceError(code, API_MESSAGE_GLOBAL.ERROR.CLOUD_UNAVAILABLE);
    }

    const fallback = MESSAGE_BY_CODE[code];
    const [cloudCode] = error.metadata?.get(GRPC_ERROR_CODE_KEY) ?? [];

    return new ServiceError(code, {
      code: typeof cloudCode === 'string' ? cloudCode : fallback.code,
      message: error.details || fallback.message,
    });
  }
}
