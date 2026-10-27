import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_CHECK_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_CHECK_ROUTER } from '../../../routers';

//Common
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
export class CheckHttpController {
  constructor(
    @Inject(CHECK_PROVIDER_TOKENS.SERVICES.CHECK)
    private readonly service: ICheckService,
  ) {}

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
