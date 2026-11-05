export type TCloudNotificationLocation = {
  id: string;
  name: string;
  type: string;
};

export type TCloudNotificationOutput = {
  id: string;
  template_code: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, string>;
  entity_type: string | null;
  entity_id: string | null;
  origin_location: TCloudNotificationLocation | null;
  origin_server: { id: string; name: string } | null;
  recipient_location: TCloudNotificationLocation | null;
  read_at: string | null;
  created_at: string;
};

export type TCloudNotificationsOutput = {
  notifications: TCloudNotificationOutput[];
  next_cursor: string | null;
};

export type TCloudNotificationsCountOutput = {
  count: number;
};

export type TCloudNotificationsInput = {
  read: boolean | null;
  cursor: string | null;
  take: number;
};
