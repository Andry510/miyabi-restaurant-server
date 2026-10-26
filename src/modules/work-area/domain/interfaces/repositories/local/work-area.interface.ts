//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TWorkAreasQuerySchema } from '../../../schemas';
import type { TWorkAreaOutput } from '../../../types/entities';
import type {
  TCreateWorkAreaInput,
  TRemoveWorkAreaResult,
  TUpdateWorkAreaInput,
} from '../../../types/repositories';

export interface IWorkAreaRepository {
  findMany(
    input: TWorkAreasQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TWorkAreaOutput>>>;

  findById(id: string): Promise<ResultPattern<TWorkAreaOutput | null>>;

  isNameInUse(
    name: string,
    exceptId: string | null,
  ): Promise<ResultPattern<boolean>>;

  create(input: TCreateWorkAreaInput): Promise<ResultPattern<TWorkAreaOutput>>;

  update(
    input: TUpdateWorkAreaInput,
  ): Promise<ResultPattern<TWorkAreaOutput | null>>;

  softDelete(id: string): Promise<ResultPattern<TRemoveWorkAreaResult>>;
}
