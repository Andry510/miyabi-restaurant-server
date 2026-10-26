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
import { API_WORK_SCHEDULE_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_WORK_SCHEDULE_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  RegisterDto,
  UpdateBodyDto,
  WorkScheduleParamDto,
  WorkSchedulesQueryDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IWorkScheduleService } from '../../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TWorkSchedulesQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { WORK_SCHEDULE_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class WorkScheduleHttpController {
  constructor(
    @Inject(WORK_SCHEDULE_PROVIDER_TOKENS.SERVICES.WORK_SCHEDULE)
    private readonly service: IWorkScheduleService,
  ) {}

  @Get(HTTP_LOCAL_WORK_SCHEDULE_ROUTER.WORK_SCHEDULES)
  @HttpManagerAccess()
  async workSchedules(
    @Query() query: WorkSchedulesQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TWorkSchedulesQuerySchema;

    const listResult = await this.service.workSchedules(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULES_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_WORK_SCHEDULE_ROUTER.REGISTER)
  @HttpManagerAccess()
  async register(
    @Body() body: RegisterDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRegisterSchema;

    const registerResult = await this.service.register(input);

    if (registerResult.IsFailure) {
      return HttpErrorMapper.reply(res, registerResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_LOCAL_WORK_SCHEDULE_ROUTER.WORK_SCHEDULE)
  @HttpManagerAccess()
  async workSchedule(
    @Param() params: WorkScheduleParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const findResult = await this.service.workSchedule(id);

    if (findResult.IsFailure) {
      return HttpErrorMapper.reply(res, findResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_RETRIEVED,
      findResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_WORK_SCHEDULE_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: WorkScheduleParamDto,
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
      API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_WORK_SCHEDULE_ROUTER.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: WorkScheduleParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
