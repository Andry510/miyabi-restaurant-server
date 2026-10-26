import type { Provider } from '@nestjs/common';

//Infrastructure
import { TRANSFER_PROVIDER_TOKENS } from '../constants';
import { CloudTransferRepository } from './cloud/transfer.repository';

export const TRANSFER_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: TRANSFER_PROVIDER_TOKENS.REPOSITORIES.CLOUD_TRANSFER,
    useClass: CloudTransferRepository,
  },
];
