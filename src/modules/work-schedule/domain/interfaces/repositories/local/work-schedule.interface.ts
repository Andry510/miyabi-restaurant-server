//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type {
  TRegisterSchema,
  TWorkSchedulesQuerySchema,
} from '../../../schemas';
import type { TWorkScheduleOutput } from '../../../types/entities';
import type {
  TRemoveWorkScheduleResult,
  TUpdateWorkScheduleInput,
} from '../../../types/repositories';

export interface IWorkScheduleRepository {
  findMany(
    input: TWorkSchedulesQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TWorkScheduleOutput>>>;

  findById(id: string): Promise<ResultPattern<TWorkScheduleOutput | null>>;

  create(input: TRegisterSchema): Promise<ResultPattern<TWorkScheduleOutput>>;

  update(
    input: TUpdateWorkScheduleInput,
  ): Promise<ResultPattern<TWorkScheduleOutput | null>>;

  softDelete(id: string): Promise<ResultPattern<TRemoveWorkScheduleResult>>;
}
