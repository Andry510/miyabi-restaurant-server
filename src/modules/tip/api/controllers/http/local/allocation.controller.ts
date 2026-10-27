import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Put,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_TIP_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_TIP_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  AreaBodyDto,
  AreaParamDto,
  MyTipsQueryDto,
} from '../../../../application/dto';

//Common
import { HttpLocalAccess, HttpManagerAccess } from '@common/decorators/access';
import { HttpUser } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TUserDetail } from '@domain/types/entities';
import type { IAllocationService } from '../../../../domain/interfaces/services';
import type {
  TAreaBodySchema,
  TAreaParamSchema,
  TMyTipsQuerySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TIP_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class AllocationHttpController {
  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.ALLOCATION)
    private readonly service: IAllocationService,
  ) {}

  @Get(HTTP_LOCAL_TIP_ROUTER.MINE)
  @HttpLocalAccess()
  async mine(
    @Query() query: MyTipsQueryDto,
    @HttpUser() user: TUserDetail,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TMyTipsQuerySchema;

    const mineResult = await this.service.mine(user, input);

    if (mineResult.IsFailure) {
      return HttpErrorMapper.reply(res, mineResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.MY_TIPS_RETRIEVED,
      mineResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_TIP_ROUTER.AREA)
  @HttpManagerAccess()
  async resetArea(
    @Param() params: AreaParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id, work_area_id: workAreaId } =
      params as unknown as TAreaParamSchema;

    const resetResult = await this.service.resetArea(id, workAreaId);

    if (resetResult.IsFailure) {
      return HttpErrorMapper.reply(res, resetResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.AREA_RESET,
      resetResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Put(HTTP_LOCAL_TIP_ROUTER.AREA)
  @HttpManagerAccess()
  async area(
    @Param() params: AreaParamDto,
    @Body() body: AreaBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id, work_area_id: workAreaId } =
      params as unknown as TAreaParamSchema;
    const input = body as unknown as TAreaBodySchema;

    const areaResult = await this.service.area(id, workAreaId, input);

    if (areaResult.IsFailure) {
      return HttpErrorMapper.reply(res, areaResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.AREA_UPDATED,
      areaResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
