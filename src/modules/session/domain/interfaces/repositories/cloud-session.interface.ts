//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TClientInput, TCloudTokens } from '@domain/types/shared';
import type { TRefreshTokenOutput } from '../../types/entities';

export interface ICloudSessionRepository {
  refreshToken(
    input: TClientInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>>;

  logout(tokens: TCloudTokens): Promise<ResultPattern<null, ServiceError>>;
}
