//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TNotificationCreate,
  TNotificationCursor,
  TNotificationOutput,
  TNotificationReader,
  TNotificationTemplate,
} from '../../../types/entities';
import type { TStoredTemplate } from '../../../types/repositories';

export interface INotificationRepository {
  ensureTemplates(
    templates: readonly TNotificationTemplate[],
  ): Promise<ResultPattern<null>>;

  findTemplate(code: string): Promise<ResultPattern<TStoredTemplate | null>>;

  createMany(input: TNotificationCreate): Promise<ResultPattern<number>>;

  findMany(
    reader: TNotificationReader,
    read: boolean | null,
    cursor: TNotificationCursor | null,
    take: number,
  ): Promise<ResultPattern<TNotificationOutput[]>>;

  countUnread(reader: TNotificationReader): Promise<ResultPattern<number>>;

  deleteSeen(before: Date): Promise<ResultPattern<number>>;

  markRead(
    reader: TNotificationReader,
    ids: string[],
  ): Promise<ResultPattern<number>>;
}
