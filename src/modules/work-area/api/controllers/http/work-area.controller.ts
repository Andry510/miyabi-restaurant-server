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
import { API_WORK_AREA_MESSAGE } from '../../messages';
import { HTTP_WORK_AREA_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  WorkAreaParamDto,
  WorkAreasQueryDto,
  RegisterDto,
  UpdateBodyDto,
} from '../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IWorkAreaService } from '../../../domain/interfaces/services';
import type {
  TWorkAreasQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { WORK_AREA_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class WorkAreaHttpController {
  constructor(
    @Inject(WORK_AREA_PROVIDER_TOKENS.SERVICES.WORK_AREA)
    private readonly service: IWorkAreaService,
  ) {}

  @Get(HTTP_WORK_AREA_ROUTER.LOCAL.WORK_AREAS)
  @HttpManagerAccess()
  async workAreas(
    @Query() query: WorkAreasQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TWorkAreasQuerySchema;

    const listResult = await this.service.workAreas(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_WORK_AREA_ROUTER.LOCAL.REGISTER)
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
      API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_WORK_AREA_ROUTER.LOCAL.WORK_AREA)
  @HttpManagerAccess()
  async workArea(
    @Param() params: WorkAreaParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const findResult = await this.service.workArea(id);

    if (findResult.IsFailure) {
      return HttpErrorMapper.reply(res, findResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_RETRIEVED,
      findResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_WORK_AREA_ROUTER.LOCAL.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: WorkAreaParamDto,
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
      API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_WORK_AREA_ROUTER.LOCAL.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: WorkAreaParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
