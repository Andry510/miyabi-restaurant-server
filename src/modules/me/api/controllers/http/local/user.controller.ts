import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Patch,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_ME_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_ME_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  ChangePasswordBodyDto,
  UpdateProfileBodyDto,
} from '../../../../application/dto';

//Common
import { HttpLocalAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { ILocalUserService } from '../../../../domain/interfaces/services';
import type {
  TChangePasswordBodySchema,
  TUpdateProfileBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class LocalUserHttpController {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.SERVICES.LOCAL)
    private readonly service: ILocalUserService,
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

  @Patch(HTTP_LOCAL_ME_ROUTER.UPDATE)
  @HttpLocalAccess()
  async updateProfile(
    @HttpUser() user: TUserDetail,
    @Body() body: UpdateProfileBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TUpdateProfileBodySchema;

    const updateResult = await this.service.updateProfile(user, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ME_MESSAGE.SUCCESS.PROFILE_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_ME_ROUTER.PASSWORD)
  @HttpLocalAccess()
  async changePassword(
    @HttpUser('id') userId: string,
    @Body() body: ChangePasswordBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TChangePasswordBodySchema;

    const changeResult = await this.service.changePassword(userId, input);

    if (changeResult.IsFailure) {
      return HttpErrorMapper.reply(res, changeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_ME_MESSAGE.SUCCESS.PASSWORD_CHANGED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
