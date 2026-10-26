import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { SupplierProductParamDto } from '../../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISupplierProductService } from '../../../../domain/interfaces/services';
import type { TSupplierProductParamSchema } from '../../../../domain/schemas';
import type { TSupplierProductOutput } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SupplierProductHttpController {
  constructor(
    @Inject(SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER_PRODUCT)
    private readonly service: ISupplierProductService,
  ) {}

  @Get(HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER.LINK.DETAIL)
  async detail(
    @Param() params: SupplierProductParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = params as unknown as TSupplierProductParamSchema;

    const detailResult = await this.service.supplierProduct(
      input,
      access_token,
    );

    if (detailResult.IsFailure) {
      const response = detailResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response =
      ControllerResponseMapper.toDataResult<TSupplierProductOutput>(
        API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.SUPPLIER_PRODUCT_RETRIEVED,
        detailResult.Value,
      );

    return res.status(HttpStatus.OK).json(response);
  }
}
