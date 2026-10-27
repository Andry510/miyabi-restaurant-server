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
import { HTTP_LOCAL_AUTHENTICATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  LoginBodyDto,
  ResetPasswordBodyDto,
} from '../../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ILocalAuthenticationService } from '../../../../domain/interfaces/services';
import type {
  TLoginOutput,
  TResetPasswordOutput,
} from '../../../../domain/types/entities';
import type {
  TLoginInput,
  TResetPasswordInput,
} from '../../../../domain/types/services';

//Infrastructure
import { ExtractClient } from '@infrastructure/http';
import {
  ControllerResponseMapper,
  HttpErrorMapper,
  ServiceResultMapper,
} from '@infrastructure/mappers/shared';
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class LocalAuthenticationHttpController {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.SERVICES.LOCAL)
    private readonly service: ILocalAuthenticationService,
  ) {}

  @Post(HTTP_LOCAL_AUTHENTICATION_ROUTER.LOGIN)
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

    const message = loginResult.Value.password
      ? API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED
      : API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN;

    const response = ControllerResponseMapper.toDataResult<TLoginOutput>(
      message,
      loginResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_AUTHENTICATION_ROUTER.PASSWORD_RESET)
  async resetPassword(
    @Body() body: ResetPasswordBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @HttpAuthorization() password_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    if (!password_token) {
      const response = ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.PASSWORD_TOKEN_REQUIRED,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const input = {
      ...(body as object),
      ...ExtractClient.client(ip, userAgent),
    } as unknown as TResetPasswordInput;

    const resetResult = await this.service.resetPassword(input, password_token);

    if (resetResult.IsFailure) {
      const response = resetResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response =
      ControllerResponseMapper.toDataResult<TResetPasswordOutput>(
        API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_UPDATED,
        resetResult.Value,
      );

    return res.status(HttpStatus.OK).json(response);
  }
}
