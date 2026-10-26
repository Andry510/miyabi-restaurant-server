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
  WorkAreasIdsBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IProductService } from '../../../../domain/interfaces/services';
import type {
  TWorkAreasIdsBodySchema,
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
export class ProductHttpController {
  constructor(
    @Inject(AREA_PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT)
    private readonly service: IProductService,
  ) {}

  @Get(HTTP_LOCAL_AREA_PRODUCT_ROUTER.PRODUCT.WORK_AREAS)
  @HttpManagerAccess()
  async workAreas(
    @Param() params: LinkParamDto,
    @Query() query: LinksQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TLinksQuerySchema;

    const listResult = await this.service.workAreas(id, input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_AREA_PRODUCT_ROUTER.PRODUCT.ASSIGN)
  @HttpManagerAccess()
  async assign(
    @Param() params: LinkParamDto,
    @Body() body: WorkAreasIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TWorkAreasIdsBodySchema;

    const assignResult = await this.service.assign(id, input.work_areas_ids);

    if (assignResult.IsFailure) {
      return HttpErrorMapper.reply(res, assignResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.LINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_AREA_PRODUCT_ROUTER.PRODUCT.REMOVE)
  @HttpManagerAccess()
  async remove(
    @Param() params: LinkParamDto,
    @Body() body: WorkAreasIdsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TWorkAreasIdsBodySchema;

    const removeResult = await this.service.remove(id, input.work_areas_ids);

    if (removeResult.IsFailure) {
      return HttpErrorMapper.reply(res, removeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_AREA_PRODUCT_MESSAGE.SUCCESS.UNLINKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
