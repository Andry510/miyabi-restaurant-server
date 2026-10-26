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

//Domain
import type { IRepositoryService } from '../../modules/repository/domain/interfaces/services';

//Infrastructure
import { HttpErrorMapper } from '@infrastructure/mappers/shared';
import { REPOSITORY_PROVIDER_TOKENS } from '../../modules/repository/infrastructure/constants';

@Injectable()
export class HttpPairingGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository: IRepositoryService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const pairingAccess = this.reflector.getAllAndOverride<boolean | undefined>(
      HTTP_PAIRING_ACCESS_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (pairingAccess) {
      return true;
    }

    const tokenResult = this.repository.serverToken();

    if (tokenResult.IsFailure) {
      const response = context.switchToHttp().getResponse<Response>();
      HttpErrorMapper.reply(response, tokenResult.Error);
      return false;
    }

    return true;
  }
}
