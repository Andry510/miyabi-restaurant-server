import type { Provider } from '@nestjs/common';

//Application
import { HydrationService } from './hydration.service';

//Infrastructure
import { SERVER_PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SERVER_PRODUCT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SERVER_PRODUCT_PROVIDER_TOKENS.SERVICES.HYDRATION,
    useClass: HydrationService,
  },
];
