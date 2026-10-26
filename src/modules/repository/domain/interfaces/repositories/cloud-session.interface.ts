//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens } from '@domain/types/shared';

export interface ICloudSessionRepository {
  validate(tokens: TCloudTokens): Promise<ResultPattern<null, ServiceError>>;
}
