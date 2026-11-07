import type { PrismaClient } from '@generated/prisma/client';
import type { notificationsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { INotificationRepository } from '../../../domain/interfaces/repositories';
import type {
  TNotificationCreate,
  TNotificationCreated,
  TNotificationCursor,
  TNotificationOutput,
  TNotificationReader,
  TNotificationTemplate,
} from '../../../domain/types/entities';
import type { TStoredTemplate } from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { NotificationMapper } from '../../mappers';

const NOTIFICATION_SELECT = {
  id: true,
  template_code: true,
  template: { select: { category: true } },
  title: true,
  body: true,
  data: true,
  entity_type: true,
  entity_id: true,
  read_at: true,
  created_at: true,
};

@Injectable()
export class NotificationRepository implements INotificationRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  ensureTemplates = (
    templates: readonly TNotificationTemplate[],
  ): Promise<ResultPattern<null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      async () => {
        await this.primaryDatabase.notification_templates.createMany({
          data: [...templates],
          skipDuplicates: true,
        });

        return null;
      },
    );

  findTemplate = (
    code: string,
  ): Promise<ResultPattern<TStoredTemplate | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      () =>
        this.primaryDatabase.notification_templates.findUnique({
          where: { code },
          select: {
            category: true,
            audience: true,
            title: true,
            body: true,
            status: true,
          },
        }),
    );

  createMany = (
    input: TNotificationCreate,
  ): Promise<ResultPattern<TNotificationCreated[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      async () => {
        const created =
          await this.primaryDatabase.notifications.createManyAndReturn({
            select: { id: true },
            data: input.user_ids.map((userId) => ({
              audience: input.audience,
              user_id: userId,
              template_code: input.template_code,
              data: input.data,
              title: input.title,
              body: input.body,
              entity_type: input.entity_type,
              entity_id: input.entity_id,
            })),
          });

        const response = await this.primaryDatabase.notifications.findMany({
          where: { id: { in: created.map((row) => row.id) } },
          select: { ...NOTIFICATION_SELECT, user_id: true },
        });

        return response.map((row) => ({
          user_id: row.user_id,
          notification: NotificationMapper.toOutput(row),
        }));
      },
    );

  findMany = (
    reader: TNotificationReader,
    read: boolean | null,
    cursor: TNotificationCursor | null,
    take: number,
  ): Promise<ResultPattern<TNotificationOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      async () => {
        const where: notificationsWhereInput = {
          ...this.whereReader(reader, read),
          ...(cursor
            ? {
                OR: [
                  { created_at: { lt: cursor.created_at } },
                  { created_at: cursor.created_at, id: { lt: cursor.id } },
                ],
              }
            : {}),
        };

        const response = await this.primaryDatabase.notifications.findMany({
          where,
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          take,
          select: {
            ...NOTIFICATION_SELECT,
            ...(reader.audience === 'manager'
              ? {
                  reads: {
                    where: { reader_email: reader.email },
                    select: { read_at: true },
                    take: 1,
                  },
                }
              : {}),
          },
        });

        return response.map((row) => NotificationMapper.toOutput(row));
      },
    );

  countUnread = (reader: TNotificationReader): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      () =>
        this.primaryDatabase.notifications.count({
          where: this.whereReader(reader, false),
        }),
    );

  deleteSeen = (before: Date): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      async () => {
        const response = await this.primaryDatabase.notifications.deleteMany({
          where: {
            OR: [
              { audience: 'employee', read_at: { lt: before } },
              {
                audience: 'manager',
                created_at: { lt: before },
                reads: { some: { read_at: { lt: before } } },
              },
            ],
          },
        });

        return response.count;
      },
    );

  markRead = (
    reader: TNotificationReader,
    ids: string[],
  ): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      NotificationRepository.name,
      async () => {
        const where: notificationsWhereInput = {
          ...this.whereReader(reader, false),
          ...(ids.length > 0 ? { id: { in: ids } } : {}),
        };

        if (reader.audience === 'employee') {
          const response = await this.primaryDatabase.notifications.updateMany({
            where,
            data: { read_at: new Date() },
          });

          return response.count;
        }

        const unread = await this.primaryDatabase.notifications.findMany({
          where,
          select: { id: true },
        });

        const response =
          await this.primaryDatabase.notification_reads.createMany({
            data: unread.map((notification) => ({
              notification_id: notification.id,
              reader_email: reader.email,
            })),
            skipDuplicates: true,
          });

        return response.count;
      },
    );

  //Functions
  private whereReader(
    reader: TNotificationReader,
    read: boolean | null,
  ): notificationsWhereInput {
    if (reader.audience === 'employee') {
      return {
        audience: 'employee',
        user_id: reader.user_id,
        ...(read === null ? {} : { read_at: read ? { not: null } : null }),
      };
    }

    const readBy = { reader_email: reader.email };

    return {
      audience: 'manager',
      ...(read === null
        ? {}
        : { reads: read ? { some: readBy } : { none: readBy } }),
    };
  }
}
