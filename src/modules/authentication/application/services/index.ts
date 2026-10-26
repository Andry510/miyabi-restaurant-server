import type { Provider } from '@nestjs/common';

//Application
import { AuthenticationService } from './authentication.service';
import { LocalService } from './local.service';
import { MfaService } from './mfa.service';
import { PasswordService } from './password.service';

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
    useClass: LocalService,
  },
];
