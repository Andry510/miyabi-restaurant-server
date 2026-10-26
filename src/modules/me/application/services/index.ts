import type { Provider } from '@nestjs/common';

//Application
import { LocalService } from './local/user.service';
import { LocationService } from './cloud/location.service';
import { UserService } from './cloud/user.service';

//Infrastructure
import { ME_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const ME_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: ME_PROVIDER_TOKENS.SERVICES.USER,
    useClass: UserService,
  },
  {
    provide: ME_PROVIDER_TOKENS.SERVICES.LOCATION,
    useClass: LocationService,
  },
  {
    provide: ME_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalService,
  },
];
