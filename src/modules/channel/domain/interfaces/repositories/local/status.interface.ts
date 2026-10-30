//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TStatusSnapshot } from '../../../types/services';

export interface IStatusRepository {
  snapshot(): Promise<ResultPattern<TStatusSnapshot>>;
}
