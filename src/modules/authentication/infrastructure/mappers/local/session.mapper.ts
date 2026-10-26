import type { session_status } from '@generated/prisma/client';
import type { sessionsUncheckedCreateInput } from '@generated/prisma/models';

//Domain
import type { UserSession } from '../../../domain/entities';

export class SessionMapper {
  static toPersistence(session: UserSession): sessionsUncheckedCreateInput {
    const { status, ...props } = session.Output;

    return {
      ...props,
      status: status as session_status,
    };
  }
}
