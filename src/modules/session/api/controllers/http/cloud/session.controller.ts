import {
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';

//Api
import { API_SESSION_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SESSION_ROUTER } from '../../../routers';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISessionService } from '../../../../domain/interfaces/services';

//Infrastructure
import { ExtractHttpToken } from '@infrastructure/http';
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

  @Post(HTTP_CLOUD_SESSION_ROUTER.LOGOUT)
  async logout(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const sessionToken = ExtractHttpToken.authorization(req);

    if (!sessionToken) {
      const response = ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const logoutResult = await this.service.logout(sessionToken);

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
