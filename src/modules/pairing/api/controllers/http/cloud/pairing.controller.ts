import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  PAIRING_TAG,
  PAIRING_CLOUD_REGISTER_DOCS,
  PAIRING_CLOUD_REPLACE_TOKEN_DOCS,
  PAIRING_CLOUD_STATUS_DOCS,
} from '../../../swagger';
import { API_PAIRING_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_PAIRING_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { RegisterDto, ReplaceTokenDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpPairingAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IPairingService } from '../../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TReplaceTokenSchema,
} from '../../../../domain/schemas';
import type {
  TPairingStatusOutput,
  TRegisterOutput,
} from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { PAIRING_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(PAIRING_TAG)
export class PairingHttpController {
  constructor(
    @Inject(PAIRING_PROVIDER_TOKENS.SERVICES.PAIRING)
    private readonly service: IPairingService,
  ) {}

  @HttpPairingAccess()
  @HttpDocs(PAIRING_CLOUD_REGISTER_DOCS)
  @Post(HTTP_CLOUD_PAIRING_ROUTER.REGISTER)
  async register(
    @Body() data: RegisterDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = data as unknown as TRegisterSchema;

    const registerResult = await this.service.register(input);

    if (registerResult.IsFailure) {
      const response = registerResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TRegisterOutput>(
      API_PAIRING_MESSAGE.SUCCESS.SERVER_PAIRED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @HttpPairingAccess()
  @HttpDocs(PAIRING_CLOUD_REPLACE_TOKEN_DOCS)
  @Post(HTTP_CLOUD_PAIRING_ROUTER.TOKEN)
  async replaceToken(
    @Body() data: ReplaceTokenDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = data as unknown as TReplaceTokenSchema;

    const replaceResult = await this.service.replaceToken(input);

    if (replaceResult.IsFailure) {
      const response = replaceResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response =
      ControllerResponseMapper.toDataResult<TPairingStatusOutput>(
        API_PAIRING_MESSAGE.SUCCESS.TOKEN_REPLACED,
        replaceResult.Value,
      );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpPairingAccess()
  @HttpDocs(PAIRING_CLOUD_STATUS_DOCS)
  @Get(HTTP_CLOUD_PAIRING_ROUTER.STATUS)
  status(@Res() res: Response): Response {
    const statusResult = this.service.status();

    if (statusResult.IsFailure) {
      const response = statusResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response =
      ControllerResponseMapper.toDataResult<TPairingStatusOutput>(
        API_PAIRING_MESSAGE.SUCCESS.STATUS_RETRIEVED,
        statusResult.Value,
      );

    return res.status(HttpStatus.OK).json(response);
  }
}
