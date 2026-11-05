import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudMeRepository } from '../../../domain/interfaces/repositories';
import type { INotificationService } from '../../../domain/interfaces/services';
import type {
  TCloudNotificationsCountOutput,
  TCloudNotificationsInput,
  TCloudNotificationsOutput,
} from '../../../domain/types/entities';

//Infrastructure
import { ME_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.REPOSITORIES.CLOUD_ME)
    private readonly cloud_me_repository: ICloudMeRepository,
  ) {}

  notifications(
    input: TCloudNotificationsInput,
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsOutput, ServiceError>> {
    return this.cloud_me_repository.notifications(input, {
      authorization: accessToken,
    });
  }

  unreadCount(
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsCountOutput, ServiceError>> {
    return this.cloud_me_repository.unreadNotificationsCount({
      authorization: accessToken,
    });
  }

  read(
    notificationIds: string[],
    accessToken: string | null,
  ): Promise<ResultPattern<TCloudNotificationsCountOutput, ServiceError>> {
    return this.cloud_me_repository.readNotifications(notificationIds, {
      authorization: accessToken,
    });
  }
}
