//Domain
import type {
  TCloudNotificationLocation,
  TCloudNotificationOutput,
  TCloudNotificationsOutput,
} from '../../../domain/types/entities';

type TGrpcLocation = { id?: string; name?: string; type?: string } | null;

export type TGrpcNotification = {
  id: string;
  template_code: string;
  category: string;
  title: string;
  body: string;
  data: string;
  entity_type?: string | null;
  entity_id?: string | null;
  origin_location?: TGrpcLocation;
  origin_server?: { id?: string; name?: string } | null;
  recipient_location?: TGrpcLocation;
  read_at?: string | null;
  created_at: string;
};

export type TGrpcNotifications = {
  notifications?: TGrpcNotification[];
  next_cursor?: string | null;
};

export class CloudNotificationMapper {
  static toOutput = (
    response: TGrpcNotifications | undefined,
  ): TCloudNotificationsOutput => ({
    notifications: (response?.notifications ?? []).map((notification) =>
      CloudNotificationMapper.toNotification(notification),
    ),
    next_cursor: response?.next_cursor || null,
  });

  //Functions
  private static toNotification = (
    notification: TGrpcNotification,
  ): TCloudNotificationOutput => ({
    id: notification.id,
    template_code: notification.template_code,
    category: notification.category,
    title: notification.title,
    body: notification.body,
    data: CloudNotificationMapper.toData(notification.data),
    entity_type: notification.entity_type || null,
    entity_id: notification.entity_id || null,
    origin_location: CloudNotificationMapper.toLocation(
      notification.origin_location,
    ),
    origin_server: notification.origin_server?.id
      ? {
          id: notification.origin_server.id,
          name: notification.origin_server.name ?? '',
        }
      : null,
    recipient_location: CloudNotificationMapper.toLocation(
      notification.recipient_location,
    ),
    read_at: notification.read_at || null,
    created_at: notification.created_at,
  });

  private static toLocation = (
    location: TGrpcLocation | undefined,
  ): TCloudNotificationLocation | null =>
    location?.id
      ? {
          id: location.id,
          name: location.name ?? '',
          type: location.type ?? '',
        }
      : null;

  private static toData = (value: string): Record<string, string> => {
    try {
      const parsed: unknown = JSON.parse(value);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }

      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([key, item]) => [
          key,
          String(item),
        ]),
      );
    } catch {
      return {};
    }
  };
}
