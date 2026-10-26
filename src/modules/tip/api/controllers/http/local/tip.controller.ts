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
import { API_TIP_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_TIP_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  PoolsQueryDto,
  RegisterDto,
  TipParamDto,
  UpdateBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { ITipService } from '../../../../domain/interfaces/services';
import type {
  TPoolsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TIP_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class TipHttpController {
  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.TIP)
    private readonly service: ITipService,
  ) {}

  @Get(HTTP_LOCAL_TIP_ROUTER.POOLS)
  @HttpManagerAccess()
  async pools(
    @Query() query: PoolsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TPoolsQuerySchema;

    const listResult = await this.service.pools(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_TIP_MESSAGE.SUCCESS.POOLS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_TIP_ROUTER.REGISTER)
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
      API_TIP_MESSAGE.SUCCESS.POOL_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_LOCAL_TIP_ROUTER.POOL)
  @HttpManagerAccess()
  async pool(
    @Param() params: TipParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const findResult = await this.service.pool(id);

    if (findResult.IsFailure) {
      return HttpErrorMapper.reply(res, findResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.POOL_RETRIEVED,
      findResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_TIP_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: TipParamDto,
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
      API_TIP_MESSAGE.SUCCESS.POOL_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_TIP_ROUTER.CLOSE)
  @HttpManagerAccess()
  async close(
    @Param() params: TipParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const closeResult = await this.service.close(id);

    if (closeResult.IsFailure) {
      return HttpErrorMapper.reply(res, closeResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.POOL_CLOSED,
      closeResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_TIP_ROUTER.REOPEN)
  @HttpManagerAccess()
  async reopen(
    @Param() params: TipParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const reopenResult = await this.service.reopen(id);

    if (reopenResult.IsFailure) {
      return HttpErrorMapper.reply(res, reopenResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.POOL_REOPENED,
      reopenResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_TIP_ROUTER.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: TipParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_TIP_MESSAGE.SUCCESS.POOL_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
