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
import { API_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { ProductParamDto, ProductsQueryDto } from '../../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IProductService } from '../../../../domain/interfaces/services';
import type {
  TProductParamSchema,
  TProductsQuerySchema,
} from '../../../../domain/schemas';
import type { TProductOutput } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { PRODUCT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class ProductHttpController {
  constructor(
    @Inject(PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT)
    private readonly service: IProductService,
  ) {}

  @Get(HTTP_CLOUD_PRODUCT_ROUTER.PRODUCTS)
  async products(
    @Query() query: ProductsQueryDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TProductsQuerySchema;

    const productsResult = await this.service.products(input, access_token);

    if (productsResult.IsFailure) {
      const response = productsResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
      productsResult.Value.data,
      productsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_CLOUD_PRODUCT_ROUTER.PRODUCT)
  async product(
    @Param() params: ProductParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = params as unknown as TProductParamSchema;

    const productResult = await this.service.product(input, access_token);

    if (productResult.IsFailure) {
      const response = productResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TProductOutput>(
      API_PRODUCT_MESSAGE.SUCCESS.PRODUCT_RETRIEVED,
      productResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
