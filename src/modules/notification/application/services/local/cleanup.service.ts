import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

//Domain
import type { INotificationRepository } from '../../../domain/interfaces/repositories';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Duration } from '@infrastructure/utils';
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_LOGGER_NAME,
  NOTIFICATION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class CleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(
    NOTIFICATION_LOGGER_NAME.SERVICE.CLEANUP,
  );

  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.REPOSITORIES.NOTIFICATION)
    private readonly notification_repository: INotificationRepository,
  ) {}

  onModuleInit(): void {
    void this.clean();
    this.timer = setInterval(
      () => void this.clean(),
      NOTIFICATION_LIMITS.CLEANUP_INTERVAL_MS,
    );
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  //Functions
  private async clean(): Promise<void> {
    const before = new Date(
      Date.now() - NOTIFICATION_LIMITS.RETENTION_DAYS * Duration.DAY_MS,
    );

    const deleteResult = await this.notification_repository.deleteSeen(before);

    if (deleteResult.IsFailure) {
      this.logger.error(deleteResult.Error);
    }
  }
}
