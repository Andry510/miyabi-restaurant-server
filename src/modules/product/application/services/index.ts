import type { Provider } from '@nestjs/common';

//Application
import { LocalProductService } from './local';
import { ProductService } from './cloud';

//Infrastructure
import { PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const PRODUCT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT,
    useClass: ProductService,
  },
  {
    provide: PRODUCT_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalProductService,
  },
];
