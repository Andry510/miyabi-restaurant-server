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
import { API_ORDER_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_ORDER_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  MineQueryDto,
  OrderParamDto,
  RequestBodyDto,
  UpdateRequestDto,
} from '../../../../application/dto';

//Common
import { HttpLocalAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IRequestService } from '../../../../domain/interfaces/services';
import type {
  TMineQuerySchema,
  TRequestBodySchema,
  TUpdateRequestSchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ORDER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class RequestHttpController {
  constructor(
    @Inject(ORDER_PROVIDER_TOKENS.SERVICES.REQUEST)
    private readonly service: IRequestService,
  ) {}

  @Get(HTTP_LOCAL_ORDER_ROUTER.MINE)
  @HttpLocalAccess()
  async mine(
    @Query() query: MineQueryDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TMineQuerySchema;

    const mineResult = await this.service.mine(user, input);

    if (mineResult.IsFailure) {
      return HttpErrorMapper.reply(res, mineResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.MY_REQUESTS_RETRIEVED,
      mineResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_ORDER_ROUTER.REQUESTS)
  @HttpLocalAccess()
  async save(
    @Body() body: RequestBodyDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRequestBodySchema;

    const saveResult = await this.service.save(user, input);

    if (saveResult.IsFailure) {
      return HttpErrorMapper.reply(res, saveResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.REQUEST_SAVED,
      saveResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Patch(HTTP_LOCAL_ORDER_ROUTER.REQUEST)
  @HttpLocalAccess()
  async update(
    @Param() params: OrderParamDto,
    @Body() body: UpdateRequestDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TUpdateRequestSchema;

    const updateResult = await this.service.update(user, id, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.REQUEST_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_ORDER_ROUTER.REQUEST)
  @HttpLocalAccess()
  async remove(
    @Param() params: OrderParamDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const removeResult = await this.service.remove(user, id);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_ORDER_MESSAGE.SUCCESS.REQUEST_DELETED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
