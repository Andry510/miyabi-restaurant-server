import type { Provider } from '@nestjs/common';

//Application
import { TransferService } from './transfer.service';

//Infrastructure
import { TRANSFER_ITEM_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const TRANSFER_ITEM_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: TRANSFER_ITEM_PROVIDER_TOKENS.SERVICES.TRANSFER,
    useClass: TransferService,
  },
];
