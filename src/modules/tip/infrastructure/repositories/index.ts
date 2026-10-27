import type { Provider } from '@nestjs/common';

//Infrastructure
import { TIP_PROVIDER_TOKENS } from '../constants';
import { AllocationRepository, RuleRepository, TipRepository } from './local';

export const TIP_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: TIP_PROVIDER_TOKENS.REPOSITORIES.ALLOCATION,
    useClass: AllocationRepository,
  },
  {
    provide: TIP_PROVIDER_TOKENS.REPOSITORIES.RULE,
    useClass: RuleRepository,
  },
  {
    provide: TIP_PROVIDER_TOKENS.REPOSITORIES.TIP,
    useClass: TipRepository,
  },
];
