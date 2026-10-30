import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_USER_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_USER_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  RegisterDto,
  UpdateBodyDto,
  UserParamDto,
  UsersQueryDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IUserService } from '../../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TUsersQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { USER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class UserHttpController {
  constructor(
    @Inject(USER_PROVIDER_TOKENS.SERVICES.USER)
    private readonly service: IUserService,
  ) {}

  @Get(HTTP_LOCAL_USER_ROUTER.USERS)
  @HttpManagerAccess()
  async users(
    @Query() query: UsersQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TUsersQuerySchema;

    const usersResult = await this.service.users(input);

    if (usersResult.IsFailure) {
      return HttpErrorMapper.reply(res, usersResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_USER_MESSAGE.SUCCESS.USERS_RETRIEVED,
      usersResult.Value.data,
      usersResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_USER_ROUTER.REGISTER)
  @HttpManagerAccess()
  async register(
    @Body() body: RegisterDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRegisterSchema;

    const registerResult = await this.service.register(input, access_token);

    if (registerResult.IsFailure) {
      return HttpErrorMapper.reply(res, registerResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_CREATED,
      Buffer.from(registerResult.Value),
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_LOCAL_USER_ROUTER.USER)
  @HttpManagerAccess()
  async user(
    @Param() params: UserParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const userResult = await this.service.user(id);

    if (userResult.IsFailure) {
      return HttpErrorMapper.reply(res, userResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_RETRIEVED,
      userResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_USER_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: UserParamDto,
    @Body() body: UpdateBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TUpdateBodySchema;

    const updateResult = await this.service.update(id, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_USER_ROUTER.PASSWORD_RESET)
  @HttpManagerAccess()
  async resetPassword(
    @Param() params: UserParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const resetResult = await this.service.resetPassword(id, access_token);

    if (resetResult.IsFailure) {
      return HttpErrorMapper.reply(res, resetResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.PASSWORD_RESET,
      Buffer.from(resetResult.Value),
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_USER_ROUTER.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: UserParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_USER_MESSAGE.SUCCESS.USER_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
