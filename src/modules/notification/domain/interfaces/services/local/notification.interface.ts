//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TNotificationsQuerySchema,
  TReadNotificationsBodySchema,
} from '../../../schemas';
import type {
  TNotificationReader,
  TNotificationsCountOutput,
  TNotificationsOutput,
  TNotifyInput,
} from '../../../types/entities';

export interface INotificationService {
  notify(input: TNotifyInput): Promise<void>;
}

export interface IReaderService {
  notifications(
    reader: TNotificationReader,
    input: TNotificationsQuerySchema,
  ): Promise<ResultPattern<TNotificationsOutput, ServiceError>>;

  unreadCount(
    reader: TNotificationReader,
  ): Promise<ResultPattern<TNotificationsCountOutput, ServiceError>>;

  read(
    reader: TNotificationReader,
    input: TReadNotificationsBodySchema,
  ): Promise<ResultPattern<TNotificationsCountOutput, ServiceError>>;
}
