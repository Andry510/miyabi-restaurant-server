import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_SHIFT_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_SHIFT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  RegisterDto,
  ShiftParamDto,
  ShiftsQueryDto,
  UpdateBodyDto,
} from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IShiftService } from '../../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TShiftsQuerySchema,
  TUpdateBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SHIFT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class ShiftHttpController {
  constructor(
    @Inject(SHIFT_PROVIDER_TOKENS.SERVICES.SHIFT)
    private readonly service: IShiftService,
  ) {}

  @Get(HTTP_LOCAL_SHIFT_ROUTER.SHIFTS)
  @HttpManagerAccess()
  async shifts(
    @Query() query: ShiftsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TShiftsQuerySchema;

    const listResult = await this.service.shifts(input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_SHIFT_MESSAGE.SUCCESS.SHIFTS_RETRIEVED,
      listResult.Value.data,
      listResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(HTTP_LOCAL_SHIFT_ROUTER.REGISTER)
  @HttpManagerAccess()
  async register(
    @Body() body: RegisterDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRegisterSchema;

    const registerResult = await this.service.register(input);

    if (registerResult.IsFailure) {
      return HttpErrorMapper.reply(res, registerResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.SHIFTS_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_LOCAL_SHIFT_ROUTER.SHIFT)
  @HttpManagerAccess()
  async shift(
    @Param() params: ShiftParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const findResult = await this.service.shift(id);

    if (findResult.IsFailure) {
      return HttpErrorMapper.reply(res, findResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.SHIFT_RETRIEVED,
      findResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_SHIFT_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Param() params: ShiftParamDto,
    @Body() body: UpdateBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TUpdateBodySchema;

    const updateResult = await this.service.update(id, input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.SHIFT_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_SHIFT_ROUTER.CANCEL)
  @HttpManagerAccess()
  async cancel(
    @Param() params: ShiftParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const cancelResult = await this.service.cancel(id);

    if (cancelResult.IsFailure) {
      return HttpErrorMapper.reply(res, cancelResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.SHIFT_CANCELLED,
      cancelResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
