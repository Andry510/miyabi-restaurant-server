import type { Provider } from '@nestjs/common';

//Application
import { ShiftService } from './local/shift.service';

//Infrastructure
import { SHIFT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SHIFT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SHIFT_PROVIDER_TOKENS.SERVICES.SHIFT,
    useClass: ShiftService,
  },
];
