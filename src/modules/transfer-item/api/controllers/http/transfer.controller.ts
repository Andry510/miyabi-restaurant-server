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
import { API_TRANSFER_ITEM_MESSAGE } from '../../messages';
import { HTTP_TRANSFER_ITEM_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  TransferItemParamDto,
  TransferItemsQueryDto,
} from '../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ITransferService } from '../../../domain/interfaces/services';
import type { TTransferItemsSchema } from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TRANSFER_ITEM_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class TransferHttpController {
  constructor(
    @Inject(TRANSFER_ITEM_PROVIDER_TOKENS.SERVICES.TRANSFER)
    private readonly service: ITransferService,
  ) {}

  @Get(HTTP_TRANSFER_ITEM_ROUTER.TRANSFER.ITEMS)
  async items(
    @Param() params: TransferItemParamDto,
    @Query() query: TransferItemsQueryDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = {
      ...(params as object),
      ...(query as object),
    } as unknown as TTransferItemsSchema;

    const itemsResult = await this.service.items(input, access_token);

    if (itemsResult.IsFailure) {
      const response = itemsResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_TRANSFER_ITEM_MESSAGE.SUCCESS.ITEMS_RETRIEVED,
      itemsResult.Value.data,
      itemsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
