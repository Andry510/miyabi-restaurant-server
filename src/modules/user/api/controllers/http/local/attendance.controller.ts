import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
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
import { AttendanceQueryDto, UserParamDto } from '../../../../application/dto';

//Common
import { HttpLocalAccess, HttpManagerAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IAttendanceService } from '../../../../domain/interfaces/services';
import type { TAttendanceQuerySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { USER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class AttendanceHttpController {
  constructor(
    @Inject(USER_PROVIDER_TOKENS.SERVICES.ATTENDANCE)
    private readonly service: IAttendanceService,
  ) {}

  @Get(HTTP_LOCAL_USER_ROUTER.ATTENDANCE)
  @HttpManagerAccess()
  async attendance(
    @Param() params: UserParamDto,
    @Query() query: AttendanceQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TAttendanceQuerySchema;

    const attendanceResult = await this.service.attendance(id, input);

    if (attendanceResult.IsFailure) {
      return HttpErrorMapper.reply(res, attendanceResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_USER_MESSAGE.SUCCESS.ATTENDANCE_RETRIEVED,
      attendanceResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_LOCAL_USER_ROUTER.MY_ATTENDANCE)
  @HttpLocalAccess()
  async myAttendance(
    @Query() query: AttendanceQueryDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TAttendanceQuerySchema;

    const attendanceResult = await this.service.mine(user, input);

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
