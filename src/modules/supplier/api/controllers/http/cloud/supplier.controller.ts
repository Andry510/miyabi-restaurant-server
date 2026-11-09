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
  SUPPLIER_TAG,
  SUPPLIER_CLOUD_SUPPLIERS_DOCS,
  SUPPLIER_CLOUD_SUPPLIER_DOCS,
} from '../../../swagger';
import { API_SUPPLIER_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_SUPPLIER_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  SupplierParamDto,
  SuppliersQueryDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISupplierService } from '../../../../domain/interfaces/services';
import type {
  TSupplierParamSchema,
  TSuppliersQuerySchema,
} from '../../../../domain/schemas';
import type { TSupplierOutput } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SUPPLIER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(SUPPLIER_TAG)
export class SupplierHttpController {
  constructor(
    @Inject(SUPPLIER_PROVIDER_TOKENS.SERVICES.SUPPLIER)
    private readonly service: ISupplierService,
  ) {}

  @HttpDocs(SUPPLIER_CLOUD_SUPPLIERS_DOCS)
  @Get(HTTP_CLOUD_SUPPLIER_ROUTER.SUPPLIER.SUPPLIERS)
  async suppliers(
    @Query() query: SuppliersQueryDto,
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TSuppliersQuerySchema;

    const suppliersResult = await this.service.suppliers(input, access_token);

    if (suppliersResult.IsFailure) {
      const response = suppliersResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_SUPPLIER_MESSAGE.SUCCESS.SUPPLIERS_RETRIEVED,
      suppliersResult.Value.data,
      suppliersResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(SUPPLIER_CLOUD_SUPPLIER_DOCS)
  @Get(HTTP_CLOUD_SUPPLIER_ROUTER.SUPPLIER.SUPPLIER)
  async supplier(
    @Param() params: SupplierParamDto,
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = params as unknown as TSupplierParamSchema;

    const supplierResult = await this.service.supplier(input, access_token);

    if (supplierResult.IsFailure) {
      const response = supplierResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TSupplierOutput>(
      API_SUPPLIER_MESSAGE.SUCCESS.SUPPLIER_RETRIEVED,
      supplierResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
