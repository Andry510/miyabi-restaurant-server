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
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  TRANSFER_ITEM_TAG,
  TRANSFER_ITEM_CLOUD_TRANSFER_ITEMS_DOCS,
} from '../../../swagger';
import { API_TRANSFER_ITEM_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_TRANSFER_ITEM_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  TransferItemParamDto,
  TransferItemsQueryDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ITransferService } from '../../../../domain/interfaces/services';
import type { TTransferItemsSchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TRANSFER_ITEM_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(TRANSFER_ITEM_TAG)
export class TransferHttpController {
  constructor(
    @Inject(TRANSFER_ITEM_PROVIDER_TOKENS.SERVICES.TRANSFER)
    private readonly service: ITransferService,
  ) {}

  @HttpDocs(TRANSFER_ITEM_CLOUD_TRANSFER_ITEMS_DOCS)
  @Get(HTTP_CLOUD_TRANSFER_ITEM_ROUTER.TRANSFER.ITEMS)
  async items(
    @Param() params: TransferItemParamDto,
    @Query() query: TransferItemsQueryDto,
    @HttpCloudAuthorization() access_token: string | null,
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
