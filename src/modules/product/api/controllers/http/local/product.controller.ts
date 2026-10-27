import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { LocalProductsQueryDto } from '../../../../application/dto';

//Common
import { HttpLocalAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { ILocalProductService } from '../../../../domain/interfaces/services';
import type { TLocalProductsQuerySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { PRODUCT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class LocalProductHttpController {
  constructor(
    @Inject(PRODUCT_PROVIDER_TOKENS.SERVICES.LOCAL)
    private readonly service: ILocalProductService,
  ) {}

  @Get(HTTP_LOCAL_PRODUCT_ROUTER.PRODUCTS)
  @HttpLocalAccess()
  async products(
    @Query() query: LocalProductsQueryDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TLocalProductsQuerySchema;

    const productsResult = await this.service.products(input, user);

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
}
