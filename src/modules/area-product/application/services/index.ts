import type { Provider } from '@nestjs/common';

//Application
import { ProductService, WorkAreaService } from './local';

//Infrastructure
import { AREA_PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const AREA_PRODUCT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: AREA_PRODUCT_PROVIDER_TOKENS.SERVICES.WORK_AREA,
    useClass: WorkAreaService,
  },
  {
    provide: AREA_PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT,
    useClass: ProductService,
  },
];
