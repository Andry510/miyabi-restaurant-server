//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TJobPositionsQuerySchema } from '../../../schemas';
import type { TJobPositionOutput } from '../../../types/entities';
import type {
  TCreateJobPositionInput,
  TRemoveJobPositionResult,
  TUpdateJobPositionInput,
} from '../../../types/repositories';

export interface IJobPositionRepository {
  findMany(
    input: TJobPositionsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TJobPositionOutput>>>;

  findById(id: string): Promise<ResultPattern<TJobPositionOutput | null>>;

  isNameInUse(
    name: string,
    exceptId: string | null,
  ): Promise<ResultPattern<boolean>>;

  create(
    input: TCreateJobPositionInput,
  ): Promise<ResultPattern<TJobPositionOutput>>;

  update(
    input: TUpdateJobPositionInput,
  ): Promise<ResultPattern<TJobPositionOutput | null>>;

  softDelete(id: string): Promise<ResultPattern<TRemoveJobPositionResult>>;
}
