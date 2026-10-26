import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_AREA_JOB_POSITION_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_AREA_JOB_POSITION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  LinksQueryDto,
  LinkParamDto,
  JobPositionsIdsBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IWorkAreaService } from '../../../../domain/interfaces/services';
import type {
  TJobPositionsIdsBodySchema,
  TLinksQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { AREA_JOB_POSITION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class WorkAreaHttpController {
  constructor(
    @Inject(AREA_JOB_POSITION_PROVIDER_TOKENS.SERVICES.WORK_AREA)
    private readonly service: IWorkAreaService,
  ) {}

  @Get(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.WORK_AREA.JOB_POSITIONS)
  @HttpManagerAccess()
  async jobPositions(
    @Param() params: LinkParamDto,
    @Query() query: LinksQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TLinksQuerySchema;

    const listResult = await this.service.jobPositions(id, input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITIONS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.WORK_AREA.ASSIGN)
  @HttpManagerAccess()
  async assign(
    @Param() params: LinkParamDto,
    @Body() body: JobPositionsIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TJobPositionsIdsBodySchema;

    const assignResult = await this.service.assign(id, input.job_positions_ids);

    if (assignResult.IsFailure) {
      return HttpErrorMapper.reply(res, assignResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.LINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.WORK_AREA.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: LinkParamDto,
    @Body() body: JobPositionsIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TJobPositionsIdsBodySchema;

    const removeResult = await this.service.remove(id, input.job_positions_ids);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.UNLINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.WORK_AREA.USERS)
  @HttpManagerAccess()
  async users(
    @Param() params: LinkParamDto,
    @Query() query: LinksQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TLinksQuerySchema;

    const usersResult = await this.service.users(id, input);

    if (usersResult.IsFailure) {
      return HttpErrorMapper.reply(res, usersResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.USERS_RETRIEVED,
      usersResult.Value.data,
      usersResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
