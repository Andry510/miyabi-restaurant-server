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
import { API_USER_MESSAGE } from '../../messages';
import { HTTP_USER_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  AttendanceQueryDto,
  RegisterDto,
  SessionsQueryDto,
  UpdateBodyDto,
  UserParamDto,
  UsersQueryDto,
} from '../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type {
  IAttendanceService,
  ISessionService,
  IUserService,
} from '../../../domain/interfaces/services';
import type {
  TAttendanceQuerySchema,
  TRegisterSchema,
  TSessionsQuerySchema,
  TUpdateBodySchema,
  TUsersQuerySchema,
} from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { USER_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class UserHttpController {
  constructor(
    @Inject(USER_PROVIDER_TOKENS.SERVICES.USER)
    private readonly user_service: IUserService,
    @Inject(USER_PROVIDER_TOKENS.SERVICES.SESSION)
    private readonly session_service: ISessionService,
    @Inject(USER_PROVIDER_TOKENS.SERVICES.ATTENDANCE)
    private readonly attendance_service: IAttendanceService,
  ) {}

  @Get(HTTP_USER_ROUTER.LOCAL.USERS)
  @HttpManagerAccess()
  async users(
    @Query() query: UsersQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TUsersQuerySchema;

    const usersResult = await this.user_service.users(input);

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

  @Post(HTTP_USER_ROUTER.LOCAL.REGISTER)
  @HttpManagerAccess()
  async register(
    @Body() body: RegisterDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRegisterSchema;

    const registerResult = await this.user_service.register(input);

    if (registerResult.IsFailure) {
      return HttpErrorMapper.reply(res, registerResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_USER_ROUTER.LOCAL.USER)
  @HttpManagerAccess()
  async user(
    @Param() params: UserParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const userResult = await this.user_service.user(id);

    if (userResult.IsFailure) {
      return HttpErrorMapper.reply(res, userResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_RETRIEVED,
      userResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_USER_ROUTER.LOCAL.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: UserParamDto,
    @Body() body: UpdateBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TUpdateBodySchema;

    const updateResult = await this.user_service.update(id, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.USER_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_USER_ROUTER.LOCAL.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: UserParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.user_service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_USER_MESSAGE.SUCCESS.USER_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_USER_ROUTER.LOCAL.SESSIONS)
  @HttpManagerAccess()
  async sessions(
    @Param() params: UserParamDto,
    @Query() query: SessionsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TSessionsQuerySchema;

    const sessionsResult = await this.session_service.sessions(id, input);

    if (sessionsResult.IsFailure) {
      return HttpErrorMapper.reply(res, sessionsResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_USER_MESSAGE.SUCCESS.SESSIONS_RETRIEVED,
      sessionsResult.Value.data,
      sessionsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_USER_ROUTER.LOCAL.ATTENDANCE)
  @HttpManagerAccess()
  async attendance(
    @Param() params: UserParamDto,
    @Query() query: AttendanceQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TAttendanceQuerySchema;

    const attendanceResult = await this.attendance_service.attendance(
      id,
      input,
    );

    if (attendanceResult.IsFailure) {
      return HttpErrorMapper.reply(res, attendanceResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.ATTENDANCE_RETRIEVED,
      attendanceResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
