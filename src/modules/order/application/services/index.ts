import type { Provider } from '@nestjs/common';

//Application
import { OrderService } from './local/order.service';
import { RequestService } from './local/request.service';

//Infrastructure
import { ORDER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const ORDER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.ORDER,
    useClass: OrderService,
  },
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.REQUEST,
    useClass: RequestService,
  },
];
