import type { Provider } from '@nestjs/common';

//Infrastructure
import { TRANSFER_ITEM_PROVIDER_TOKENS } from '../constants';
import { CloudTransferItemRepository } from './cloud-transfer-item.repository';

export const TRANSFER_ITEM_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: TRANSFER_ITEM_PROVIDER_TOKENS.REPOSITORIES.CLOUD_TRANSFER_ITEM,
    useClass: CloudTransferItemRepository,
  },
];
