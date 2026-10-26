import {
  Controller,
  Headers,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_SESSION_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SESSION_ROUTER } from '../../../routers';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISessionService } from '../../../../domain/interfaces/services';
import type { TRefreshTokenOutput } from '../../../../domain/types/entities';

//Infrastructure
import { ExtractClient } from '@infrastructure/http';
import {
  ControllerResponseMapper,
  HttpErrorMapper,
  ServiceResultMapper,
} from '@infrastructure/mappers/shared';
import { SESSION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SessionHttpController {
  constructor(
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.SESSION)
    private readonly service: ISessionService,
  ) {}

  @Post(HTTP_CLOUD_SESSION_ROUTER.REFRESH_TOKEN)
  async refreshToken(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @HttpAuthorization() refresh_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    if (!refresh_token) {
      const response = ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.MISSING_REFRESH_TOKEN,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const input = ExtractClient.client(ip, userAgent);

    const refreshResult = await this.service.refreshToken(input, refresh_token);

    if (refreshResult.IsFailure) {
      const response = refreshResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TRefreshTokenOutput>(
      API_SESSION_MESSAGE.SUCCESS.TOKEN_UPDATED,
      refreshResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_CLOUD_SESSION_ROUTER.LOGOUT)
  async logout(
    @HttpAuthorization() refresh_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    if (!refresh_token) {
      const response = ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.MISSING_REFRESH_TOKEN,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const logoutResult = await this.service.logout(refresh_token);

    if (logoutResult.IsFailure) {
      const response = logoutResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_SESSION_MESSAGE.SUCCESS.SESSION_LOGGED_OUT,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
