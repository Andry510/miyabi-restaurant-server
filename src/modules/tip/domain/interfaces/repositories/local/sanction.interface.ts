//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TSanctionTypeBodySchema,
  TUpdateSanctionTypeBodySchema,
} from '../../../schemas';
import type { TTipSanctionTypeOutput } from '../../../types/entities';
import type { TCreateTipSanctionInput } from '../../../types/repositories';

export interface ISanctionRepository {
  findTypes(): Promise<ResultPattern<TTipSanctionTypeOutput[]>>;

  findType(id: string): Promise<ResultPattern<TTipSanctionTypeOutput | null>>;

  createType(
    input: TSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput | null>>;

  updateType(
    id: string,
    input: TUpdateSanctionTypeBodySchema,
  ): Promise<
    ResultPattern<TTipSanctionTypeOutput | 'not_found' | 'duplicated'>
  >;

  removeType(id: string): Promise<ResultPattern<'ok' | 'not_found' | 'in_use'>>;

  create(
    input: TCreateTipSanctionInput,
    type: TTipSanctionTypeOutput,
  ): Promise<ResultPattern<boolean>>;

  remove(poolId: string, sanctionId: string): Promise<ResultPattern<boolean>>;
}
