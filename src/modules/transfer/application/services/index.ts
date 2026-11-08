import type { Provider } from '@nestjs/common';

//Application
import { ConfirmationService, TransferService } from './cloud';

//Infrastructure
import { TRANSFER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const TRANSFER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: TRANSFER_PROVIDER_TOKENS.SERVICES.TRANSFER,
    useClass: TransferService,
  },
  {
    provide: TRANSFER_PROVIDER_TOKENS.SERVICES.CONFIRMATION,
    useClass: ConfirmationService,
  },
];
