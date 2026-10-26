//Domain
import type { SESSION_STATUS } from '@domain/enums/shared';

export type TSessionProps = {
  secret_key: string;
  refresh_token_hash: string;
  status: SESSION_STATUS;
  requester_ip: string | null;
  device: string | null;
  browser: string | null;
  user_id: string;
  expire_at: Date | null;
};
