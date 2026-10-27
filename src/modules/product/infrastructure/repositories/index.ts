import type { Provider } from '@nestjs/common';

//Infrastructure
import { PRODUCT_PROVIDER_TOKENS } from '../constants';
import { CloudProductRepository } from './cloud';
import { ProductRepository } from './local';

export const PRODUCT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_PRODUCT,
    useClass: CloudProductRepository,
  },
  {
    provide: PRODUCT_PROVIDER_TOKENS.REPOSITORIES.PRODUCT,
    useClass: ProductRepository,
  },
];
