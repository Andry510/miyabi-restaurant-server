//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TRulesBodySchema } from '../../../schemas';
import type { TTipRulesOutput } from '../../../types/entities';

export interface IRuleService {
  rules(): Promise<ResultPattern<TTipRulesOutput, ServiceError>>;

  update(
    input: TRulesBodySchema,
  ): Promise<ResultPattern<TTipRulesOutput, ServiceError>>;
}
