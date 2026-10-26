import type { sessions } from '@generated/prisma/client';

//Domain
import type { TSessionOutput } from '../../domain/types/entities';

type TSessionRow = Pick<
  sessions,
  | 'id'
  | 'status'
  | 'requester_ip'
  | 'device'
  | 'browser'
  | 'last_access_at'
  | 'expire_at'
  | 'revoked_by'
  | 'revoked_at'
  | 'created_at'
>;

export class SessionMapper {
  static toOutput = (row: TSessionRow): TSessionOutput => ({ ...row });
}
