//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TJobPositionsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../schemas';
import type { TJobPositionOutput } from '../../../types/entities';

export interface IJobPositionService {
  jobPositions(
    input: TJobPositionsQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TJobPositionOutput>, ServiceError>
  >;

  jobPosition(
    id: string,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TJobPositionOutput, ServiceError>>;

  remove(id: string): Promise<ResultPattern<null, ServiceError>>;
}
