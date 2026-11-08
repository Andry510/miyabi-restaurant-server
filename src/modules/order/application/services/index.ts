import type { Provider } from '@nestjs/common';

//Application
import {
  DispatchService,
  ExportService,
  OrderService,
  RequestService,
} from './local';

//Infrastructure
import { ORDER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const ORDER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.DISPATCH,
    useClass: DispatchService,
  },
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.EXPORT,
    useClass: ExportService,
  },
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.ORDER,
    useClass: OrderService,
  },
  {
    provide: ORDER_PROVIDER_TOKENS.SERVICES.REQUEST,
    useClass: RequestService,
  },
];
