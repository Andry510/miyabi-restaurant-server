//Domain
import type { TNotificationOutput } from '../../../domain/types/entities';

type TNotificationRow = {
  id: string;
  template_code: string;
  template: { category: string };
  title: string;
  body: string;
  data: unknown;
  entity_type: string | null;
  entity_id: string | null;
  read_at: Date | null;
  reads?: Array<{ read_at: Date }>;
  created_at: Date;
};

export class NotificationMapper {
  static toOutput = (row: TNotificationRow): TNotificationOutput => ({
    id: row.id,
    template_code: row.template_code,
    category: row.template.category,
    title: row.title,
    body: row.body,
    data: NotificationMapper.toData(row.data),
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    read_at: row.reads ? (row.reads[0]?.read_at ?? null) : row.read_at,
    created_at: row.created_at,
  });

  //Functions
  private static toData = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        String(item),
      ]),
    );
  };
}
