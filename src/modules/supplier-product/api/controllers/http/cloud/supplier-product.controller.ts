import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  SUPPLIER_PRODUCT_TAG,
  SUPPLIER_PRODUCT_CLOUD_DETAIL_DOCS,
} from '../../../swagger';
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { SupplierProductParamDto } from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
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
@ApiTags(SUPPLIER_PRODUCT_TAG)
export class SupplierProductHttpController {
  constructor(
    @Inject(SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER_PRODUCT)
    private readonly service: ISupplierProductService,
  ) {}

  @HttpDocs(SUPPLIER_PRODUCT_CLOUD_DETAIL_DOCS)
  @Get(HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER.LINK.DETAIL)
  @HttpManagerAccess()
  async detail(
    @Param() params: SupplierProductParamDto,
    @HttpCloudAuthorization() access_token: string | null,
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
