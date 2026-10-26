import type { Provider } from '@nestjs/common';

//Application
import { LocalService } from './local/product.service';
import { ProductService } from './cloud/product.service';

//Infrastructure
import { PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const PRODUCT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT,
    useClass: ProductService,
  },
  {
    provide: PRODUCT_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalService,
  },
];
