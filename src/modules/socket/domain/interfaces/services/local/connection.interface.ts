import type { Server } from 'socket.io';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TConnection, TConnectionTokens } from '../../../types/entities';

export interface IConnectionService {
  attach(server: Server): void;

  track(
    socketId: string,
    tokens: TConnectionTokens,
    connection: TConnection,
  ): void;

  untrack(socketId: string): void;

  authenticate(
    tokens: TConnectionTokens,
  ): Promise<ResultPattern<TConnection, ServiceError>>;

  channels(connection: TConnection): string[];
}
