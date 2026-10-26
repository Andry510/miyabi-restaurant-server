//Domain
import type { SESSION_STATUS } from '@domain/enums/shared';

export type TRefreshTokenOutput = {
  access_token: string;
  refresh_token: string;
};

export type TSessionProps = {
  id: string;
  secret_key: string;
  refresh_token_hash: string;
  status: SESSION_STATUS;
  user_id: string;
  requester_ip: string | null;
  device: string | null;
  browser: string | null;
  revoked_by: string | null;
  revoked_at: Date | null;
  expire_at: Date | null;
};
