import type { Provider } from '@nestjs/common';

//Infrastructure
import { SERVER_PRODUCT_PROVIDER_TOKENS } from '../constants';
import { CloudServerProductRepository } from './cloud';
import { ProductRepository } from './local';

export const SERVER_PRODUCT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SERVER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.PRODUCT,
    useClass: ProductRepository,
  },
  {
    provide: SERVER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SERVER_PRODUCT,
    useClass: CloudServerProductRepository,
  },
];
