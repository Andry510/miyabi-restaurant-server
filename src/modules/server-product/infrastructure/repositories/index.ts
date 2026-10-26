import type { Provider } from '@nestjs/common';

//Infrastructure
import { SERVER_PRODUCT_PROVIDER_TOKENS } from '../constants';
import { CloudServerProductRepository } from './cloud/server-product.repository';
import { ProductRepository } from './local/product.repository';

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
