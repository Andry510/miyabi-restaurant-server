//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TWorkSchedulesQuerySchema,
} from '../../../schemas';
import type { TWorkScheduleOutput } from '../../../types/entities';

export interface IWorkScheduleService {
  workSchedules(
    input: TWorkSchedulesQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TWorkScheduleOutput>, ServiceError>
  >;

  workSchedule(
    id: string,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>>;

  remove(id: string): Promise<ResultPattern<null, ServiceError>>;
}
