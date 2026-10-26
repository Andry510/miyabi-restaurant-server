//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TPoolsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../schemas';
import type {
  TTipPoolDetailOutput,
  TTipPoolOutput,
} from '../../../types/entities';
import type { TTipPool } from '../../../types/repositories';

export interface ITipService {
  openPool(id: string): Promise<ResultPattern<TTipPool, ServiceError>>;

  pools(
    input: TPoolsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TTipPoolOutput>, ServiceError>>;

  pool(id: string): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  close(id: string): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  reopen(id: string): Promise<ResultPattern<TTipPoolOutput, ServiceError>>;

  remove(id: string): Promise<ResultPattern<null, ServiceError>>;
}
