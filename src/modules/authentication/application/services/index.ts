import type { Provider } from '@nestjs/common';

//Application
import { AuthenticationService, MfaService, PasswordService } from './cloud';
import { LocalAuthenticationService } from './local';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const AUTHENTICATION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.SERVICES.AUTHENTICATION,
    useClass: AuthenticationService,
  },
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.SERVICES.MFA,
    useClass: MfaService,
  },
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.SERVICES.PASSWORD,
    useClass: PasswordService,
  },
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalAuthenticationService,
  },
];
