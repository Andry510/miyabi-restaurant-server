import { HttpStatus } from '@nestjs/common';

//Api
import { API_SETTING_MESSAGE } from '../../messages';

//Application
import { UpdateSettingsDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SETTING_LOCAL_SETTINGS_DOCS: THttpDocs = {
  summary: 'Ver configuración',
  access: 'manager',
  success: API_SETTING_MESSAGE.SUCCESS.SETTINGS_RETRIEVED,
};

export const SETTING_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar configuración',
  access: 'manager',
  body: UpdateSettingsDto,
  success: API_SETTING_MESSAGE.SUCCESS.SETTINGS_UPDATED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_SETTING_MESSAGE.ERROR.TIP_POOLS_OPEN,
    },
  ],
};
