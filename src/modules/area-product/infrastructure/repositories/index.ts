import type { Provider } from '@nestjs/common';

//Infrastructure
import { AREA_PRODUCT_PROVIDER_TOKENS } from '../constants';
import { AreaProductRepository } from './local/area-product.repository';

export const AREA_PRODUCT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: AREA_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.AREA_PRODUCT,
    useClass: AreaProductRepository,
  },
];
