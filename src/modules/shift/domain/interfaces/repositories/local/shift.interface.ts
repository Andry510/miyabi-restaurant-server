//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TShiftsQuerySchema } from '../../../schemas';
import type { TShiftOutput } from '../../../types/entities';
import type {
  TCreateShiftsInput,
  TEditableShift,
  TShiftEmployee,
  TShiftRange,
} from '../../../types/repositories';

export interface IShiftRepository {
  findMany(
    input: TShiftsQuerySchema,
    range: TShiftRange,
  ): Promise<ResultPattern<TPaginationRepository<TShiftOutput>>>;

  findById(id: string): Promise<ResultPattern<TShiftOutput | null>>;

  findEditable(id: string): Promise<ResultPattern<TEditableShift | null>>;

  findEmployee(userId: string): Promise<ResultPattern<TShiftEmployee>>;

  hasOverlap(
    assignmentId: string,
    ranges: TShiftRange[],
    exceptShiftId: string | null,
  ): Promise<ResultPattern<boolean>>;

  createMany(input: TCreateShiftsInput): Promise<ResultPattern<TShiftOutput[]>>;

  reschedule(
    id: string,
    data: { work_schedule_id: string; range: TShiftRange; note?: string },
  ): Promise<ResultPattern<boolean>>;

  cancel(id: string): Promise<ResultPattern<boolean>>;
}
