//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TClientInput } from '@domain/types/shared';
import type { TRefreshTokenOutput } from '../../../types/entities';

export interface ILocalSessionService {
  refreshToken(
    input: TClientInput,
    refreshToken: string,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>>;

  logout(refreshToken: string): Promise<ResultPattern<null, ServiceError>>;
}
