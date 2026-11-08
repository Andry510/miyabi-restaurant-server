//Domain
import { SERVICE_ERROR_CODE } from '@domain/enums/shared';

export const ORDER_RETRYABLE_ERRORS: readonly string[] = Object.freeze([
  SERVICE_ERROR_CODE.UNAVAILABLE,
  SERVICE_ERROR_CODE.UNAUTHORIZED,
  SERVICE_ERROR_CODE.INTERNAL,
]);

export const ORDER_LIMITS = Object.freeze({
  PENDING_NOTICE_MS: 15 * 60_000,
});
