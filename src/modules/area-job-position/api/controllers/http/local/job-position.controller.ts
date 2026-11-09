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
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  AREA_JOB_POSITION_TAG,
  AREA_JOB_POSITION_LOCAL_JOB_POSITION_ASSIGN_DOCS,
  AREA_JOB_POSITION_LOCAL_JOB_POSITION_REMOVE_DOCS,
  AREA_JOB_POSITION_LOCAL_JOB_POSITION_USERS_DOCS,
  AREA_JOB_POSITION_LOCAL_JOB_POSITION_WORK_AREAS_DOCS,
} from '../../../swagger';
import { API_AREA_JOB_POSITION_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_AREA_JOB_POSITION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  LinksQueryDto,
  LinkParamDto,
  WorkAreasIdsBodyDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IJobPositionService } from '../../../../domain/interfaces/services';
import type {
  TWorkAreasIdsBodySchema,
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
@ApiTags(AREA_JOB_POSITION_TAG)
export class JobPositionHttpController {
  constructor(
    @Inject(AREA_JOB_POSITION_PROVIDER_TOKENS.SERVICES.JOB_POSITION)
    private readonly service: IJobPositionService,
  ) {}

  @HttpDocs(AREA_JOB_POSITION_LOCAL_JOB_POSITION_WORK_AREAS_DOCS)
  @Get(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.JOB_POSITION.WORK_AREAS)
  @HttpManagerAccess()
  async workAreas(
    @Param() params: LinkParamDto,
    @Query() query: LinksQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TLinksQuerySchema;

    const listResult = await this.service.workAreas(id, input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(AREA_JOB_POSITION_LOCAL_JOB_POSITION_ASSIGN_DOCS)
  @Post(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.JOB_POSITION.ASSIGN)
  @HttpManagerAccess()
  async assign(
    @Param() params: LinkParamDto,
    @Body() body: WorkAreasIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TWorkAreasIdsBodySchema;

    const assignResult = await this.service.assign(id, input.work_areas_ids);

    if (assignResult.IsFailure) {
      return HttpErrorMapper.reply(res, assignResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.LINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(AREA_JOB_POSITION_LOCAL_JOB_POSITION_REMOVE_DOCS)
  @Delete(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.JOB_POSITION.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: LinkParamDto,
    @Body() body: WorkAreasIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TWorkAreasIdsBodySchema;

    const removeResult = await this.service.remove(id, input.work_areas_ids);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_JOB_POSITION_MESSAGE.SUCCESS.UNLINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(AREA_JOB_POSITION_LOCAL_JOB_POSITION_USERS_DOCS)
  @Get(HTTP_LOCAL_AREA_JOB_POSITION_ROUTER.JOB_POSITION.USERS)
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
