import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  AUTHENTICATION_TAG,
  AUTHENTICATION_CLOUD_MFA_CODE_DOCS,
  AUTHENTICATION_CLOUD_MFA_QR_DOCS,
} from '../../../swagger';
import { API_AUTHENTICATION_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_AUTHENTICATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { MfaCodeBodyDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IMfaService } from '../../../../domain/interfaces/services';
import type { TMfaCodeOutput } from '../../../../domain/types/entities';
import type { TWithSession } from '../../../../../session/domain/types/entities';
import type { TMfaCodeInput } from '../../../../domain/types/services';

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
@ApiTags(AUTHENTICATION_TAG)
export class MfaHttpController {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.SERVICES.MFA)
    private readonly service: IMfaService,
  ) {}

  @HttpDocs(AUTHENTICATION_CLOUD_MFA_QR_DOCS)
  @Get(HTTP_CLOUD_AUTHENTICATION_ROUTER.MFA.QR)
  async qr(
    @HttpAuthorization() mfa_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    if (!mfa_token) {
      const response = ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.MFA_TOKEN_REQUIRED,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const qrResult = await this.service.qr(mfa_token);

    if (qrResult.IsFailure) {
      const response = qrResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<string>(
      API_AUTHENTICATION_MESSAGE.SUCCESS.QR_RETRIEVED,
      qrResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(AUTHENTICATION_CLOUD_MFA_CODE_DOCS)
  @Post(HTTP_CLOUD_AUTHENTICATION_ROUTER.MFA.CODE)
  async code(
    @Body() body: MfaCodeBodyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @HttpAuthorization() mfa_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    if (!mfa_token) {
      const response = ServiceResultMapper.Unauthorized(
        API_AUTHENTICATION_MESSAGE.ERROR.MFA_TOKEN_REQUIRED,
      );
      return HttpErrorMapper.reply(res, response.Error);
    }

    const input = {
      ...(body as object),
      ...ExtractClient.client(ip, userAgent),
    } as unknown as TMfaCodeInput;

    const codeResult = await this.service.code(input, mfa_token);

    if (codeResult.IsFailure) {
      const response = codeResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const message = codeResult.Value.password
      ? API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED
      : API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN;

    const response = ControllerResponseMapper.toDataResult<
      TWithSession<TMfaCodeOutput>
    >(message, codeResult.Value);

    return res.status(HttpStatus.OK).json(response);
  }
}
