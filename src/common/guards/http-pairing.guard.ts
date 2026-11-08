import type { Response } from 'express';
import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

// oxlint-disable-next-line typescript/consistent-type-imports
import { Reflector } from '@nestjs/core';

//Common
import { HTTP_PAIRING_ACCESS_DECORATOR_KEY } from '@common/decorators/access';
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { ServiceError } from '@domain/errors';
import type { IServerService } from '../../modules/repository/domain/interfaces/services';

//Infrastructure
import { HttpErrorMapper } from '@infrastructure/mappers/shared';
import { REPOSITORY_PROVIDER_TOKENS } from '../../modules/repository/infrastructure/constants';

@Injectable()
export class HttpPairingGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.SERVER)
    private readonly server_service: IServerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const pairingAccess = this.reflector.getAllAndOverride<boolean | undefined>(
      HTTP_PAIRING_ACCESS_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (pairingAccess) {
      return true;
    }

    if (this.server_service.state().status === 'unpaired') {
      const response = context.switchToHttp().getResponse<Response>();
      HttpErrorMapper.reply(
        response,
        new ServiceError(
          'CONFLICT',
          API_MESSAGE_GLOBAL.ERROR.SERVER_NOT_PAIRED,
        ),
      );
      return false;
    }

    return true;
  }
}
