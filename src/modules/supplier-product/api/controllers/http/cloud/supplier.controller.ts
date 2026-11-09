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
  SUPPLIER_PRODUCT_TAG,
  SUPPLIER_PRODUCT_CLOUD_SUPPLIER_PRODUCTS_DOCS,
} from '../../../swagger';
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  SupplierProductIdParamDto,
  SupplierProductsQueryDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISupplierService } from '../../../../domain/interfaces/services';
import type { TSupplierProductsSchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(SUPPLIER_PRODUCT_TAG)
export class SupplierHttpController {
  constructor(
    @Inject(SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER)
    private readonly service: ISupplierService,
  ) {}

  @HttpDocs(SUPPLIER_PRODUCT_CLOUD_SUPPLIER_PRODUCTS_DOCS)
  @Get(HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER.SUPPLIER.PRODUCTS)
  @HttpManagerAccess()
  async products(
    @Param() params: SupplierProductIdParamDto,
    @Query() query: SupplierProductsQueryDto,
    @HttpCloudAuthorization() access_token: string | null,
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
