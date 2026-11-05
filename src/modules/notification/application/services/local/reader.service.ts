import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_NOTIFICATION_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { INotificationRepository } from '../../../domain/interfaces/repositories';
import type { IReaderService } from '../../../domain/interfaces/services';
import type {
  TNotificationsQuerySchema,
  TReadNotificationsBodySchema,
} from '../../../domain/schemas';
import type {
  TNotificationCursor,
  TNotificationReader,
  TNotificationsCountOutput,
  TNotificationsOutput,
} from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  NOTIFICATION_LOGGER_NAME,
  NOTIFICATION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ReaderService implements IReaderService {
  private readonly logger = new Logger(NOTIFICATION_LOGGER_NAME.SERVICE.READER);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.REPOSITORIES.NOTIFICATION)
    private readonly notification_repository: INotificationRepository,
  ) {}

  async notifications(
    reader: TNotificationReader,
    input: TNotificationsQuerySchema,
  ): Promise<ResultPattern<TNotificationsOutput, ServiceError>> {
    const cursor = input.cursor ? this.decode(input.cursor) : null;

    if (input.cursor && !cursor) {
      return ServiceResultMapper.BadRequest(
        API_NOTIFICATION_MESSAGE.ERROR.INVALID_CURSOR,
      );
    }

    const listResult = await this.notification_repository.findMany(
      reader,
      input.read,
      cursor,
      input.take + 1,
    );

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const notifications = listResult.Value.slice(0, input.take);
    const last = notifications[notifications.length - 1];

    return ServiceResultMapper.Ok({
      notifications,
      next_cursor:
        listResult.Value.length > input.take && last
          ? this.encode({ created_at: last.created_at, id: last.id })
          : null,
    });
  }

  async unreadCount(
    reader: TNotificationReader,
  ): Promise<ResultPattern<TNotificationsCountOutput, ServiceError>> {
    const countResult = await this.notification_repository.countUnread(reader);

    if (countResult.IsFailure) {
      this.logger.error(countResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({ count: countResult.Value });
  }

  async read(
    reader: TNotificationReader,
    input: TReadNotificationsBodySchema,
  ): Promise<ResultPattern<TNotificationsCountOutput, ServiceError>> {
    const readResult = await this.notification_repository.markRead(
      reader,
      input.notification_ids,
    );

    if (readResult.IsFailure) {
      this.logger.error(readResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({ count: readResult.Value });
  }

  //Functions
  private encode(cursor: TNotificationCursor): string {
    return Buffer.from(
      `${cursor.created_at.toISOString()}|${cursor.id}`,
    ).toString('base64url');
  }

  private decode(value: string): TNotificationCursor | null {
    const [createdAt, id] = Buffer.from(value, 'base64url')
      .toString('utf8')
      .split('|');
    const date = new Date(createdAt ?? '');

    if (!id || !UUID.test(id) || Number.isNaN(date.getTime())) {
      return null;
    }

    return { created_at: date, id };
  }
}
