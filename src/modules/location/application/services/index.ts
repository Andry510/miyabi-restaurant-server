import type { Provider } from '@nestjs/common';

//Application
import { LocationService } from './location.service';

//Infrastructure
import { LOCATION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const LOCATION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: LOCATION_PROVIDER_TOKENS.SERVICES.LOCATION,
    useClass: LocationService,
  },
];
