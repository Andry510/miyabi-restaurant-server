//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TClientInput } from '@domain/types/shared';
import type {
  TManagerSession,
  TRefreshTokenOutput,
  TWithSession,
} from '../../../types/entities';

export interface IManagerSessionService {
  owns(token: string | null): boolean;

  open(
    tokens: TRefreshTokenOutput,
    client: TClientInput,
  ): Promise<ResultPattern<string, ServiceError>>;

  exchange<T extends { access?: TRefreshTokenOutput }>(
    value: T,
    client: TClientInput,
  ): Promise<ResultPattern<TWithSession<T>, ServiceError>>;

  resolve(
    sessionToken: string,
    touch?: boolean,
  ): Promise<ResultPattern<TManagerSession, ServiceError>>;

  close(sessionToken: string): Promise<ResultPattern<null, ServiceError>>;

  revoke(cloudSessionKey: string): Promise<void>;
}
