import { HttpStatus } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../messages';

//Application
import { CopyWeekBodyDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SHIFT_LOCAL_WEEK_COPY_DOCS: THttpDocs = {
  summary: 'Copiar los turnos de una semana a otra',
  access: 'manager',
  body: CopyWeekBodyDto,
  status: HttpStatus.CREATED,
  success: API_SHIFT_MESSAGE.SUCCESS.WEEK_COPIED,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_SHIFT_MESSAGE.ERROR.WEEK_START,
    },
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_SHIFT_MESSAGE.ERROR.SAME_WEEK,
    },
  ],
};
