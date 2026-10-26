import {
  Body,
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
import { API_AUTHENTICATION_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_AUTHENTICATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { LoginBodyDto } from '../../../../application/dto';

//Common
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IAuthenticationService } from '../../../../domain/interfaces/services';
import type { TLoginOutput } from '../../../../domain/types/entities';
import type { TLoginInput } from '../../../../domain/types/services';

//Infrastructure
import { ExtractClient } from '@infrastructure/http';
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class AuthenticationHttpController {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.SERVICES.AUTHENTICATION)
    private readonly service: IAuthenticationService,
  ) {}

  @Post(HTTP_CLOUD_AUTHENTICATION_ROUTER.AUTHENTICATION.LOGIN)
  async login(
    @Body() body: LoginBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    const input = {
      ...(body as object),
      ...ExtractClient.client(ip, userAgent),
    } as unknown as TLoginInput;

    const loginResult = await this.service.login(input);

    if (loginResult.IsFailure) {
      const response = loginResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    let message = API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN;

    if (loginResult.Value.mfa) {
      message = API_AUTHENTICATION_MESSAGE.SUCCESS.MFA_REQUIRED;
    }

    if (loginResult.Value.password) {
      message = API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED;
    }

    const response = ControllerResponseMapper.toDataResult<TLoginOutput>(
      message,
      loginResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
