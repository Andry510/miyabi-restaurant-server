import type { Provider } from '@nestjs/common';

//Infrastructure
import { ORDER_PROVIDER_TOKENS } from '../constants';
import { OrderRepository } from './local/order.repository';
import { RequestRepository } from './local/request.repository';

export const ORDER_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: ORDER_PROVIDER_TOKENS.REPOSITORIES.ORDER,
    useClass: OrderRepository,
  },
  {
    provide: ORDER_PROVIDER_TOKENS.REPOSITORIES.REQUEST,
    useClass: RequestRepository,
  },
];
