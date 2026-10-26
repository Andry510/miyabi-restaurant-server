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
  ProductSuppliersQueryDto,
  SupplierProductIdParamDto,
} from '../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IProductService } from '../../../domain/interfaces/services';
import type { TProductSuppliersSchema } from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class ProductHttpController {
  constructor(
    @Inject(SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT)
    private readonly service: IProductService,
  ) {}

  @Get(HTTP_SUPPLIER_PRODUCT_ROUTER.PRODUCT.SUPPLIERS)
  async suppliers(
    @Param() params: SupplierProductIdParamDto,
    @Query() query: ProductSuppliersQueryDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = {
      ...(params as object),
      ...(query as object),
    } as unknown as TProductSuppliersSchema;

    const suppliersResult = await this.service.suppliers(input, access_token);

    if (suppliersResult.IsFailure) {
      const response = suppliersResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.SUPPLIERS_RETRIEVED,
      suppliersResult.Value.data,
      suppliersResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
