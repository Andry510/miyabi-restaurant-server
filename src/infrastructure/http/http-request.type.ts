//Domain
import type { TUserDetail } from '@domain/types/entities';

declare global {
  namespace Express {
    interface Request {
      user?: TUserDetail;
      cloud_access_token?: string;
    }
  }
}
