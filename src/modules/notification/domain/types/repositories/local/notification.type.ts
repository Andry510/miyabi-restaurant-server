//Domain
import type { TNotificationTemplate } from '../../entities';

export type TStoredTemplate = Omit<TNotificationTemplate, 'code'> & {
  status: boolean;
};
