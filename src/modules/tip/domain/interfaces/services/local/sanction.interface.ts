//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TPoolSanctionBodySchema,
  TSanctionTypeBodySchema,
  TUpdateSanctionTypeBodySchema,
} from '../../../schemas';
import type {
  TTipPoolDetailOutput,
  TTipSanctionTypeOutput,
} from '../../../types/entities';

export interface ISanctionService {
  types(): Promise<ResultPattern<TTipSanctionTypeOutput[], ServiceError>>;

  createType(
    input: TSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput, ServiceError>>;

  updateType(
    id: string,
    input: TUpdateSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput, ServiceError>>;

  removeType(id: string): Promise<ResultPattern<null, ServiceError>>;

  add(
    poolId: string,
    input: TPoolSanctionBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  remove(
    poolId: string,
    sanctionId: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;
}
