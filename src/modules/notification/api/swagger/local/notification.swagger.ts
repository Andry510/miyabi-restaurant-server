import { HttpStatus } from '@nestjs/common';

//Api
import { API_NOTIFICATION_MESSAGE } from '../../messages';

//Application
import {
  NotificationsQueryDto,
  ReadNotificationsBodyDto,
} from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const NOTIFICATION_LOCAL_EMPLOYEE_NOTIFICATIONS_DOCS: THttpDocs = {
  summary: 'Mis notificaciones (read, cursor, limit)',
  access: 'employee',
  query: NotificationsQueryDto,
  success: API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_RETRIEVED,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_NOTIFICATION_MESSAGE.ERROR.INVALID_CURSOR,
    },
  ],
};

export const NOTIFICATION_LOCAL_EMPLOYEE_UNREAD_COUNT_DOCS: THttpDocs = {
  summary: 'Cuántas no he leído',
  access: 'employee',
  success: API_NOTIFICATION_MESSAGE.SUCCESS.UNREAD_COUNT_RETRIEVED,
};

export const NOTIFICATION_LOCAL_EMPLOYEE_READ_DOCS: THttpDocs = {
  summary: 'Marcar como leídas (todas o notification_ids)',
  access: 'employee',
  body: ReadNotificationsBodyDto,
  success: API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_READ,
};

export const NOTIFICATION_LOCAL_MANAGER_NOTIFICATIONS_DOCS: THttpDocs = {
  summary: 'Notificaciones del equipo (read, cursor, limit)',
  access: 'manager',
  query: NotificationsQueryDto,
  success: API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_RETRIEVED,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_NOTIFICATION_MESSAGE.ERROR.INVALID_CURSOR,
    },
  ],
};

export const NOTIFICATION_LOCAL_MANAGER_UNREAD_COUNT_DOCS: THttpDocs = {
  summary: 'Cuántas del equipo no he leído',
  access: 'manager',
  success: API_NOTIFICATION_MESSAGE.SUCCESS.UNREAD_COUNT_RETRIEVED,
};

export const NOTIFICATION_LOCAL_MANAGER_READ_DOCS: THttpDocs = {
  summary: 'Marcar como leídas las del equipo (todas o notification_ids)',
  access: 'manager',
  body: ReadNotificationsBodyDto,
  success: API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_READ,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_NOTIFICATION_MESSAGE.ERROR.INVALID_CURSOR,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN,
    },
  ],
};
