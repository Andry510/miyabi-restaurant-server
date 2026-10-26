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
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../messages';
import { HTTP_SUPPLIER_PRODUCT_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  SupplierProductIdParamDto,
  SupplierProductsQueryDto,
} from '../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISupplierService } from '../../../domain/interfaces/services';
import type { TSupplierProductsSchema } from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SupplierHttpController {
  constructor(
    @Inject(SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER)
    private readonly service: ISupplierService,
  ) {}

  @Get(HTTP_SUPPLIER_PRODUCT_ROUTER.SUPPLIER.PRODUCTS)
  async products(
    @Param() params: SupplierProductIdParamDto,
    @Query() query: SupplierProductsQueryDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = {
      ...(params as object),
      ...(query as object),
    } as unknown as TSupplierProductsSchema;

    const productsResult = await this.service.products(input, access_token);

    if (productsResult.IsFailure) {
      const response = productsResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
      productsResult.Value.data,
      productsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
