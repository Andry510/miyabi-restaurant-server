import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_SHIFT_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_SHIFT_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { CopyWeekBodyDto } from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IWeekService } from '../../../../domain/interfaces/services';
import type { TCopyWeekBodySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SHIFT_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class WeekHttpController {
  constructor(
    @Inject(SHIFT_PROVIDER_TOKENS.SERVICES.WEEK)
    private readonly service: IWeekService,
  ) {}

  @Post(HTTP_LOCAL_SHIFT_ROUTER.COPY)
  @HttpManagerAccess()
  async copy(
    @Body() body: CopyWeekBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TCopyWeekBodySchema;

    const copyResult = await this.service.copy(input);

    if (copyResult.IsFailure) {
      return HttpErrorMapper.reply(res, copyResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SHIFT_MESSAGE.SUCCESS.WEEK_COPIED,
      copyResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }
}
