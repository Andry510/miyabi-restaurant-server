//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TWorkAreasQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../schemas';
import type { TWorkAreaOutput } from '../../types/entities';

export interface IWorkAreaService {
  workAreas(
    input: TWorkAreasQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TWorkAreaOutput>, ServiceError>>;

  workArea(id: string): Promise<ResultPattern<TWorkAreaOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TWorkAreaOutput, ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TWorkAreaOutput, ServiceError>>;

  remove(id: string): Promise<ResultPattern<null, ServiceError>>;
}
