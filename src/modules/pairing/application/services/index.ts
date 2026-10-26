import type { Provider } from '@nestjs/common';

//Application
import { PairingService } from './pairing.service';

//Infrastructure
import { PAIRING_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const PAIRING_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: PAIRING_PROVIDER_TOKENS.SERVICES.PAIRING,
    useClass: PairingService,
  },
];
