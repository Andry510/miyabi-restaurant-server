import type { Provider } from '@nestjs/common';

//Application
import { TransferService } from './cloud/transfer.service';

//Infrastructure
import { TRANSFER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const TRANSFER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: TRANSFER_PROVIDER_TOKENS.SERVICES.TRANSFER,
    useClass: TransferService,
  },
];
