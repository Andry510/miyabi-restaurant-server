import {
  NotificationsQuerySchema,
  ReadNotificationsBodySchema,
} from '../../../domain/schemas';

export class NotificationsQueryDto {
  static schema = NotificationsQuerySchema;
}

export class ReadNotificationsBodyDto {
  static schema = ReadNotificationsBodySchema;
}
