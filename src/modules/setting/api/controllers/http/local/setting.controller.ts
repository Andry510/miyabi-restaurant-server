import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Patch,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_SETTING_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_SETTING_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { UpdateSettingsDto } from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ISettingService } from '../../../../domain/interfaces/services';
import type { TUpdateSettingsSchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { SETTING_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SettingHttpController {
  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly service: ISettingService,
  ) {}

  @Get(HTTP_LOCAL_SETTING_ROUTER.SETTINGS)
  @HttpManagerAccess()
  async settings(@Res() res: Response): Promise<Response> {
    const settingsResult = await this.service.settings();

    if (settingsResult.IsFailure) {
      return HttpErrorMapper.reply(res, settingsResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SETTING_MESSAGE.SUCCESS.SETTINGS_RETRIEVED,
      settingsResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_LOCAL_SETTING_ROUTER.UPDATE)
  @HttpManagerAccess()
  async update(
    @Body() body: UpdateSettingsDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TUpdateSettingsSchema;

    const updateResult = await this.service.update(input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_SETTING_MESSAGE.SUCCESS.SETTINGS_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
