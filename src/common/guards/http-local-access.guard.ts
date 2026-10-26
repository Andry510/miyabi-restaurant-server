import type { Request, Response } from 'express';
import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

// oxlint-disable-next-line typescript/consistent-type-imports
import { Reflector } from '@nestjs/core';

//Common
import { HTTP_LOCAL_ACCESS_DECORATOR_KEY } from '@common/decorators/access';
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { ServiceErrorFactory } from '@domain/patterns/errors';
import type { IRepositoryService } from '../../modules/repository/domain/interfaces/services';

//Infrastructure
import { ExtractHttpToken } from '@infrastructure/http';
import { HttpErrorMapper } from '@infrastructure/mappers/shared';
import { REPOSITORY_PROVIDER_TOKENS } from '../../modules/repository/infrastructure/constants';

@Injectable()
export class HttpLocalAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository: IRepositoryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const localAccess = this.reflector.getAllAndOverride<boolean | undefined>(
      HTTP_LOCAL_ACCESS_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!localAccess) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const accessToken = ExtractHttpToken.authorization(request);

    if (!accessToken) {
      HttpErrorMapper.reply(
        response,
        ServiceErrorFactory.Unauthorized(
          API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN,
        ),
      );
      return false;
    }

    const accessResult = await this.repository.validateAccess(accessToken);

    if (accessResult.IsFailure) {
      HttpErrorMapper.reply(response, accessResult.Error);
      return false;
    }

    request.user = accessResult.Value.user;

    return true;
  }
}
