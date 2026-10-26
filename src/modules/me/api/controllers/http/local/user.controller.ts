import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_ME_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_ME_ROUTER } from '../../../routers';

//Common
import { HttpLocalAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { ILocalService } from '../../../../domain/interfaces/services';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class LocalHttpController {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.SERVICES.LOCAL)
    private readonly service: ILocalService,
  ) {}

  @Get(HTTP_LOCAL_ME_ROUTER.USER)
  @HttpLocalAccess()
  user(@HttpUser() user: TUserDetail, @Res() res: Response): Response {
    const userResult = this.service.user(user);

    if (userResult.IsFailure) {
      return HttpErrorMapper.reply(res, userResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ME_MESSAGE.SUCCESS.USER_RETRIEVED,
      userResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
