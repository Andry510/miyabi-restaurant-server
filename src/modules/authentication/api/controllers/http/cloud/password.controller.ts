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
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  AUTHENTICATION_TAG,
  AUTHENTICATION_CLOUD_PASSWORD_RESET_DOCS,
} from '../../../swagger';
import { API_AUTHENTICATION_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_AUTHENTICATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { ResetPasswordBodyDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IPasswordService } from '../../../../domain/interfaces/services';
import type { TResetPasswordOutput } from '../../../../domain/types/entities';
import type { TWithSession } from '../../../../../session/domain/types/entities';
import type { TResetPasswordInput } from '../../../../domain/types/services';

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
export class PasswordHttpController {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.SERVICES.PASSWORD)
    private readonly service: IPasswordService,
  ) {}

  @HttpDocs(AUTHENTICATION_CLOUD_PASSWORD_RESET_DOCS)
  @Post(HTTP_CLOUD_AUTHENTICATION_ROUTER.PASSWORD.RESET)
  async reset(
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

    const resetResult = await this.service.reset(input, password_token);

    if (resetResult.IsFailure) {
      const response = resetResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<
      TWithSession<TResetPasswordOutput>
    >(API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_UPDATED, resetResult.Value);

    return res.status(HttpStatus.OK).json(response);
  }
}
