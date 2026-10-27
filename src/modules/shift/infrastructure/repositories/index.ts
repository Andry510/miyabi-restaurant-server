import type { Provider } from '@nestjs/common';

//Infrastructure
import { SHIFT_PROVIDER_TOKENS } from '../constants';
import { ShiftRepository } from './local';

export const SHIFT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SHIFT_PROVIDER_TOKENS.REPOSITORIES.SHIFT,
    useClass: ShiftRepository,
  },
];
