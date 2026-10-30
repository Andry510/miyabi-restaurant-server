//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TShiftOutput } from '../../../types/entities';
import type {
  TShiftRange,
  TWeekCopy,
  TWeekSourceShift,
} from '../../../types/repositories';

export interface IWeekRepository {
  findSource(
    range: TShiftRange,
    userIds: string[] | undefined,
  ): Promise<ResultPattern<TWeekSourceShift[]>>;

  findBusy(
    assignmentIds: string[],
    range: TShiftRange,
  ): Promise<ResultPattern<Array<TShiftRange & { assignment_id: string }>>>;

  createCopies(copies: TWeekCopy[]): Promise<ResultPattern<TShiftOutput[]>>;
}
