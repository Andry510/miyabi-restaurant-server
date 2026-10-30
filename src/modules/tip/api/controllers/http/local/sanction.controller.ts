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
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_TIP_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_TIP_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  PoolSanctionBodyDto,
  PoolSanctionParamDto,
  SanctionTypeBodyDto,
  TipParamDto,
  UpdateSanctionTypeBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { ISanctionService } from '../../../../domain/interfaces/services';
import type {
  TPoolSanctionBodySchema,
  TPoolSanctionParamSchema,
  TSanctionTypeBodySchema,
  TUpdateSanctionTypeBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TIP_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SanctionHttpController {
  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.SANCTION)
    private readonly service: ISanctionService,
  ) {}

  @Get(HTTP_LOCAL_TIP_ROUTER.SANCTION_TYPES)
  @HttpManagerAccess()
  async types(@Res() res: Response): Promise<Response> {
    const typesResult = await this.service.types();

    if (typesResult.IsFailure) {
      return HttpErrorMapper.reply(res, typesResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_TYPES_RETRIEVED,
      typesResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_TIP_ROUTER.SANCTION_TYPES)
  @HttpManagerAccess()
  async createType(
    @Body() body: SanctionTypeBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TSanctionTypeBodySchema;

    const createResult = await this.service.createType(input);

    if (createResult.IsFailure) {
      return HttpErrorMapper.reply(res, createResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_CREATED,
      createResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Patch(HTTP_LOCAL_TIP_ROUTER.SANCTION_TYPE)
  @HttpManagerAccess()
  async updateType(
    @Param() params: TipParamDto,
    @Body() body: UpdateSanctionTypeBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TUpdateSanctionTypeBodySchema;

    const updateResult = await this.service.updateType(id, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_TIP_ROUTER.SANCTION_TYPE)
  @HttpManagerAccess()
  async removeType(
    @Param() params: TipParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.removeType(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_TIP_ROUTER.SANCTIONS)
  @HttpManagerAccess()
  async add(
    @Param() params: TipParamDto,
    @Body() body: PoolSanctionBodyDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TPoolSanctionBodySchema;

    const addResult = await this.service.add(id, input, access_token);

    if (addResult.IsFailure) {
      return HttpErrorMapper.reply(res, addResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_ADDED,
      addResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Delete(HTTP_LOCAL_TIP_ROUTER.SANCTION)
  @HttpManagerAccess()
  async remove(
    @Param() params: PoolSanctionParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id, sanction_id } = params as unknown as TPoolSanctionParamSchema;

    const removeResult = await this.service.remove(id, sanction_id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.SANCTION_REMOVED,
      removeResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
