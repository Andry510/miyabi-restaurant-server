import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type {
  IManagerSessionService,
  ISessionService,
} from '../../../domain/interfaces/services';

//Infrastructure
import { SESSION_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  logout(sessionToken: string): Promise<ResultPattern<null, ServiceError>> {
    return this.manager_session_service.close(sessionToken);
  }
}
