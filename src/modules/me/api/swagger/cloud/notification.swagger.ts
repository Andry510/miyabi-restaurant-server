//Api
import { API_ME_MESSAGE } from '../../messages';

//Application
import {
  NotificationsQueryDto,
  ReadNotificationsBodyDto,
} from '../../../../notification/application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ME_CLOUD_NOTIFICATION_NOTIFICATIONS_DOCS: THttpDocs = {
  summary: 'Mis notificaciones de la nube (read, cursor, limit)',
  access: 'manager',
  cloud: true,
  query: NotificationsQueryDto,
  success: API_ME_MESSAGE.SUCCESS.NOTIFICATIONS_RETRIEVED,
};

export const ME_CLOUD_NOTIFICATION_UNREAD_COUNT_DOCS: THttpDocs = {
  summary: 'Cuántas de la nube no he leído',
  access: 'manager',
  cloud: true,
  success: API_ME_MESSAGE.SUCCESS.UNREAD_COUNT_RETRIEVED,
};

export const ME_CLOUD_NOTIFICATION_READ_DOCS: THttpDocs = {
  summary: 'Marcar como leídas las de la nube (todas o notification_ids)',
  access: 'manager',
  cloud: true,
  body: ReadNotificationsBodyDto,
  success: API_ME_MESSAGE.SUCCESS.NOTIFICATIONS_READ,
};
