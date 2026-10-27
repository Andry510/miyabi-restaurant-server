import type { Provider } from '@nestjs/common';

//Application
import { AllocationService, RuleService, TipService } from './local';

//Infrastructure
import { TIP_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const TIP_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: TIP_PROVIDER_TOKENS.SERVICES.ALLOCATION,
    useClass: AllocationService,
  },
  {
    provide: TIP_PROVIDER_TOKENS.SERVICES.RULE,
    useClass: RuleService,
  },
  {
    provide: TIP_PROVIDER_TOKENS.SERVICES.TIP,
    useClass: TipService,
  },
];
