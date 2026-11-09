import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  SHIFT_TAG,
  SHIFT_LOCAL_ATTENDANCE_CORRECT_DOCS,
  SHIFT_LOCAL_ATTENDANCE_JUSTIFY_DOCS,
} from '../../../swagger';
import { API_SHIFT_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_SHIFT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  CorrectAttendanceBodyDto,
  JustifyBodyDto,
  ShiftParamDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IAttendanceService } from '../../../../domain/interfaces/services';
import type {
  TCorrectAttendanceBodySchema,
  TJustifyBodySchema,
} from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SHIFT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(SHIFT_TAG)
export class AttendanceHttpController {
  constructor(
    @Inject(SHIFT_PROVIDER_TOKENS.SERVICES.ATTENDANCE)
    private readonly service: IAttendanceService,
  ) {}

  @HttpDocs(SHIFT_LOCAL_ATTENDANCE_CORRECT_DOCS)
  @Patch(HTTP_LOCAL_SHIFT_ROUTER.ATTENDANCE)
  @HttpManagerAccess()
  async correct(
    @Param() params: ShiftParamDto,
    @Body() body: CorrectAttendanceBodyDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TCorrectAttendanceBodySchema;

    const correctResult = await this.service.correct(id, input, access_token);

    if (correctResult.IsFailure) {
      return HttpErrorMapper.reply(res, correctResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.ATTENDANCE_CORRECTED,
      correctResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(SHIFT_LOCAL_ATTENDANCE_JUSTIFY_DOCS)
  @Post(HTTP_LOCAL_SHIFT_ROUTER.JUSTIFICATION)
  @HttpManagerAccess()
  async justify(
    @Param() params: ShiftParamDto,
    @Body() body: JustifyBodyDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = body as unknown as TJustifyBodySchema;

    const justifyResult = await this.service.justify(id, input, access_token);

    if (justifyResult.IsFailure) {
      return HttpErrorMapper.reply(res, justifyResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.JUSTIFIED,
      justifyResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
