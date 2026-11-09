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
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  JOB_POSITION_TAG,
  JOB_POSITION_LOCAL_JOB_POSITIONS_DOCS,
  JOB_POSITION_LOCAL_JOB_POSITION_DOCS,
  JOB_POSITION_LOCAL_REGISTER_DOCS,
  JOB_POSITION_LOCAL_REMOVE_DOCS,
  JOB_POSITION_LOCAL_UPDATE_DOCS,
} from '../../../swagger';
import { API_JOB_POSITION_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_JOB_POSITION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  JobPositionParamDto,
  JobPositionsQueryDto,
  RegisterDto,
  UpdateBodyDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IJobPositionService } from '../../../../domain/interfaces/services';
import type {
  TJobPositionsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { JOB_POSITION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(JOB_POSITION_TAG)
export class JobPositionHttpController {
  constructor(
    @Inject(JOB_POSITION_PROVIDER_TOKENS.SERVICES.JOB_POSITION)
    private readonly service: IJobPositionService,
  ) {}

  @HttpDocs(JOB_POSITION_LOCAL_JOB_POSITIONS_DOCS)
  @Get(HTTP_LOCAL_JOB_POSITION_ROUTER.JOB_POSITIONS)
  @HttpManagerAccess()
  async jobPositions(
    @Query() query: JobPositionsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TJobPositionsQuerySchema;

    const listResult = await this.service.jobPositions(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITIONS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(JOB_POSITION_LOCAL_REGISTER_DOCS)
  @Post(HTTP_LOCAL_JOB_POSITION_ROUTER.REGISTER)
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
      API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @HttpDocs(JOB_POSITION_LOCAL_JOB_POSITION_DOCS)
  @Get(HTTP_LOCAL_JOB_POSITION_ROUTER.JOB_POSITION)
  @HttpManagerAccess()
  async jobPosition(
    @Param() params: JobPositionParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const findResult = await this.service.jobPosition(id);

    if (findResult.IsFailure) {
      return HttpErrorMapper.reply(res, findResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_RETRIEVED,
      findResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(JOB_POSITION_LOCAL_UPDATE_DOCS)
  @Patch(HTTP_LOCAL_JOB_POSITION_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: JobPositionParamDto,
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
      API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(JOB_POSITION_LOCAL_REMOVE_DOCS)
  @Delete(HTTP_LOCAL_JOB_POSITION_ROUTER.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: JobPositionParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
