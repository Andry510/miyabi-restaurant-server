//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPairInput, TPairingRow } from '../../../types';

export interface IServerRepository {
  find(): Promise<ResultPattern<TPairingRow>>;

  pair(input: TPairInput): Promise<ResultPattern<TPairingRow>>;

  unlink(reason: string): Promise<ResultPattern<TPairingRow>>;
}
