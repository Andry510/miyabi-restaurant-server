import type {
  authentications,
  session_status,
  sessions,
} from '@generated/prisma/client';
import type { sessionsUpdateInput } from '@generated/prisma/models';

//Domain
import type { SESSION_STATUS } from '@domain/enums/shared';
import { SessionAggregate } from '../../domain/aggregates';
import type { UserSession } from '../../domain/entities';

type TSessionPrisma = Pick<
  sessions,
  | 'id'
  | 'secret_key'
  | 'refresh_token_hash'
  | 'status'
  | 'user_id'
  | 'requester_ip'
  | 'device'
  | 'browser'
  | 'revoked_by'
  | 'revoked_at'
  | 'expire_at'
> & {
  user: { authentication: Pick<authentications, 'email'> | null };
};

export class SessionMapper {
  static toDomain(entity: TSessionPrisma): SessionAggregate {
    const { user, status, ...session } = entity;

    return SessionAggregate.register(
      { ...session, status: status as SESSION_STATUS },
      user.authentication?.email ?? '',
    );
  }

  static toPersistence(session: UserSession): sessionsUpdateInput {
    return {
      refresh_token_hash: session.RefreshTokenHash,
      status: session.Status as session_status,
      requester_ip: session.RequesterIp,
      revoked_by: session.RevokedBy,
      revoked_at: session.RevokedAt,
      expire_at: session.ExpireAt,
    };
  }
}
