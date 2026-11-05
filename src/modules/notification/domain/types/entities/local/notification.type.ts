//Infrastructure
import type {
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_TEMPLATE,
} from '../../../../infrastructure/constants';

export type TNotificationTemplateCode =
  (typeof NOTIFICATION_TEMPLATE)[keyof typeof NOTIFICATION_TEMPLATE];

export type TNotificationAudience =
  (typeof NOTIFICATION_AUDIENCE)[keyof typeof NOTIFICATION_AUDIENCE];

export type TNotificationTemplate = {
  code: TNotificationTemplateCode;
  category: string;
  audience: TNotificationAudience;
  title: string;
  body: string;
};

export type TNotificationValue = string | number | Date;

export type TNotifyInput = {
  template_code: TNotificationTemplateCode;
  user_ids?: string[];
  data: Record<string, TNotificationValue>;
  entity_type: string | null;
  entity_id: string | null;
};

export type TNotificationCreate = {
  audience: TNotificationAudience;
  user_ids: Array<string | null>;
  template_code: string;
  data: Record<string, string>;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
};

export type TNotificationReader =
  | { audience: 'employee'; user_id: string }
  | { audience: 'manager'; email: string };

export type TNotificationCursor = {
  created_at: Date;
  id: string;
};

export type TNotificationOutput = {
  id: string;
  template_code: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, string>;
  entity_type: string | null;
  entity_id: string | null;
  read_at: Date | null;
  created_at: Date;
};

export type TNotificationsOutput = {
  notifications: TNotificationOutput[];
  next_cursor: string | null;
};

export type TNotificationsCountOutput = {
  count: number;
};
