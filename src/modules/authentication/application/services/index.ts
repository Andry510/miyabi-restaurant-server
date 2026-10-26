import type { Provider } from '@nestjs/common';

//Application
import { AuthenticationService } from './cloud/authentication.service';
import { LocalService } from './local/authentication.service';
import { MfaService } from './cloud/mfa.service';
import { PasswordService } from './cloud/password.service';

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
