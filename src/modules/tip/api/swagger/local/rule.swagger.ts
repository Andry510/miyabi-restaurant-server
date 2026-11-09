import { HttpStatus } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../messages';

//Application
import { RulesBodyDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TIP_LOCAL_RULE_RULES_DOCS: THttpDocs = {
  summary: 'Ver reglas de propinas',
  access: 'manager',
  success: API_TIP_MESSAGE.SUCCESS.RULES_RETRIEVED,
};

export const TIP_LOCAL_RULE_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar reglas de propinas',
  access: 'manager',
  body: RulesBodyDto,
  success: API_TIP_MESSAGE.SUCCESS.RULES_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POSITION_NOT_LINKED,
    },
  ],
};
