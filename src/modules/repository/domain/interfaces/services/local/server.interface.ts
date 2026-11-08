//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPairingState, TUnlinkedHandler } from '../../../types';

export interface IServerService {
  serverToken(): ResultPattern<string, ServiceError>;

  state(): TPairingState;

  pair(
    serverToken: string,
    locationId: string,
  ): Promise<ResultPattern<TPairingState, ServiceError>>;

  unlink(reason: string): Promise<void>;

  onUnlinked(handler: TUnlinkedHandler): void;
}
