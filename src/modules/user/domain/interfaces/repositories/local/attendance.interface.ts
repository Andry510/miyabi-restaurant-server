//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TShiftOutput } from '../../../types/entities';

export interface IAttendanceRepository {
  findShiftsByUser(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<ResultPattern<TShiftOutput[]>>;
}
