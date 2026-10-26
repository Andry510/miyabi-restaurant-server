import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
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
  ItemBodyDto,
  ItemParamDto,
  OrderParamDto,
  OrdersQueryDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IOrderService } from '../../../../domain/interfaces/services';
import type {
  TItemBodySchema,
  TItemParamSchema,
  TOrdersQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ORDER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class OrderHttpController {
  constructor(
    @Inject(ORDER_PROVIDER_TOKENS.SERVICES.ORDER)
    private readonly service: IOrderService,
  ) {}

  @Get(HTTP_LOCAL_ORDER_ROUTER.CURRENT)
  @HttpManagerAccess()
  async current(@Res() res: Response): Promise<Response> {
    const currentResult = await this.service.current();

    if (currentResult.IsFailure) {
      return HttpErrorMapper.reply(res, currentResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.CURRENT_RETRIEVED,
      currentResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Put(HTTP_LOCAL_ORDER_ROUTER.ITEM)
  @HttpManagerAccess()
  async saveItem(
    @Param() params: ItemParamDto,
    @Body() body: ItemBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { product_id: productId } = params as unknown as TItemParamSchema;
    const input = body as unknown as TItemBodySchema;

    const saveResult = await this.service.saveItem(productId, input);

    if (saveResult.IsFailure) {
      return HttpErrorMapper.reply(res, saveResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ITEM_SAVED,
      saveResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_ORDER_ROUTER.ITEM)
  @HttpManagerAccess()
  async resetItem(
    @Param() params: ItemParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { product_id: productId } = params as unknown as TItemParamSchema;

    const resetResult = await this.service.resetItem(productId);

    if (resetResult.IsFailure) {
      return HttpErrorMapper.reply(res, resetResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ITEM_RESET,
      resetResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_ORDER_ROUTER.SEND)
  @HttpManagerAccess()
  async send(
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const sendResult = await this.service.send(access_token);

    if (sendResult.IsFailure) {
      return HttpErrorMapper.reply(res, sendResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ORDER_SENT,
      sendResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_LOCAL_ORDER_ROUTER.ORDERS)
  @HttpManagerAccess()
  async orders(
    @Query() query: OrdersQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TOrdersQuerySchema;

    const listResult = await this.service.orders(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_ORDER_MESSAGE.SUCCESS.ORDERS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_LOCAL_ORDER_ROUTER.ORDER)
  @HttpManagerAccess()
  async order(
    @Param() params: OrderParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const orderResult = await this.service.order(id);

    if (orderResult.IsFailure) {
      return HttpErrorMapper.reply(res, orderResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ORDER_RETRIEVED,
      orderResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_ORDER_ROUTER.RETRY)
  @HttpManagerAccess()
  async retry(
    @Param() params: OrderParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const retryResult = await this.service.retry(id, access_token);

    if (retryResult.IsFailure) {
      return HttpErrorMapper.reply(res, retryResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ORDER_SENT,
      retryResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
