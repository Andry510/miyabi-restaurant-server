//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TRulesBodySchema } from '../../../schemas';
import type { TTipRuleConfig } from '../../../types/repositories';

export interface IRuleRepository {
  findRules(): Promise<ResultPattern<TTipRuleConfig[]>>;

  replaceRules(
    rules: TRulesBodySchema['rules'],
  ): Promise<ResultPattern<boolean>>;
}
