//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TCreateManagerSessionInput,
  TManagerSessionRow,
  TManagerSessionTokens,
} from '../../../types/entities';

export interface IManagerSessionRepository {
  create(input: TCreateManagerSessionInput): Promise<ResultPattern<string>>;

  findByHash(
    tokenHash: string,
  ): Promise<ResultPattern<TManagerSessionRow | null>>;

  updateTokens(
    id: string,
    tokens: TManagerSessionTokens,
  ): Promise<ResultPattern<null>>;

  findLastAccess(id: string): Promise<ResultPattern<Date | null>>;

  touch(id: string): Promise<ResultPattern<null>>;

  deleteById(id: string): Promise<ResultPattern<null>>;

  deleteByCloudSessionKey(sessionKey: string): Promise<ResultPattern<string[]>>;

  findIdle(before: Date): Promise<ResultPattern<TManagerSessionRow[]>>;
}
