import {
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
  CHECK_TAG,
  CHECK_LOCAL_CHECK_IN_DOCS,
  CHECK_LOCAL_CHECK_OUT_DOCS,
  CHECK_LOCAL_CURRENT_DOCS,
} from '../../../swagger';
import { API_CHECK_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_CHECK_ROUTER } from '../../../routers';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpLocalAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { ICheckService } from '../../../../domain/interfaces/services';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { CHECK_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(CHECK_TAG)
export class CheckHttpController {
  constructor(
    @Inject(CHECK_PROVIDER_TOKENS.SERVICES.CHECK)
    private readonly service: ICheckService,
  ) {}

  @HttpDocs(CHECK_LOCAL_CURRENT_DOCS)
  @Get(HTTP_LOCAL_CHECK_ROUTER.CURRENT)
  @HttpLocalAccess()
  async current(
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const currentResult = await this.service.current(user);

    if (currentResult.IsFailure) {
      return HttpErrorMapper.reply(res, currentResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_CHECK_MESSAGE.SUCCESS.CURRENT_RETRIEVED,
      currentResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(CHECK_LOCAL_CHECK_IN_DOCS)
  @Post(HTTP_LOCAL_CHECK_ROUTER.IN)
  @HttpLocalAccess()
  async checkIn(
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const checkInResult = await this.service.checkIn(user);

    if (checkInResult.IsFailure) {
      return HttpErrorMapper.reply(res, checkInResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_CHECK_MESSAGE.SUCCESS.CHECKED_IN,
      checkInResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @HttpDocs(CHECK_LOCAL_CHECK_OUT_DOCS)
  @Post(HTTP_LOCAL_CHECK_ROUTER.OUT)
  @HttpLocalAccess()
  async checkOut(
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const checkOutResult = await this.service.checkOut(user);

    if (checkOutResult.IsFailure) {
      return HttpErrorMapper.reply(res, checkOutResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_CHECK_MESSAGE.SUCCESS.CHECKED_OUT,
      checkOutResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
