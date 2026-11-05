//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TCloudNotificationsCountOutput,
  TCloudNotificationsInput,
  TCloudNotificationsOutput,
} from '../../../types/entities';

export interface INotificationService {
  notifications(
    input: TCloudNotificationsInput,
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsOutput, ServiceError>>;

  unreadCount(
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsCountOutput, ServiceError>>;

  read(
    notificationIds: string[],
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsCountOutput, ServiceError>>;
}
