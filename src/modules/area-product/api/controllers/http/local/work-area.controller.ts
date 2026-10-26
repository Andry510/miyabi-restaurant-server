import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_AREA_PRODUCT_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_AREA_PRODUCT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  LinkParamDto,
  LinksQueryDto,
  ProductsIdsBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IWorkAreaService } from '../../../../domain/interfaces/services';
import type {
  TProductsIdsBodySchema,
  TLinksQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { AREA_PRODUCT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class WorkAreaHttpController {
  constructor(
    @Inject(AREA_PRODUCT_PROVIDER_TOKENS.SERVICES.WORK_AREA)
    private readonly service: IWorkAreaService,
  ) {}

  @Get(HTTP_LOCAL_AREA_PRODUCT_ROUTER.WORK_AREA.PRODUCTS)
  @HttpManagerAccess()
  async products(
    @Param() params: LinkParamDto,
    @Query() query: LinksQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TLinksQuerySchema;

    const listResult = await this.service.products(id, input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_AREA_PRODUCT_ROUTER.WORK_AREA.ASSIGN)
  @HttpManagerAccess()
  async assign(
    @Param() params: LinkParamDto,
    @Body() body: ProductsIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TProductsIdsBodySchema;

    const assignResult = await this.service.assign(id, input.products_ids);

    if (assignResult.IsFailure) {
      return HttpErrorMapper.reply(res, assignResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.LINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_AREA_PRODUCT_ROUTER.WORK_AREA.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: LinkParamDto,
    @Body() body: ProductsIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TProductsIdsBodySchema;

    const removeResult = await this.service.remove(id, input.products_ids);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.UNLINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
