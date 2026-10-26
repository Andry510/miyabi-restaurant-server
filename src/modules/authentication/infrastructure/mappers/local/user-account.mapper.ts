import type { authentications, users } from '@generated/prisma/client';

//Domain
import { UserAccount } from '../../../domain/entities';

type TUserAccountPrisma = Pick<
  authentications,
  'email' | 'password' | 'password_need_reset'
> & {
  user: Pick<users, 'id' | 'status' | 'deleted_at'>;
};

export class UserAccountMapper {
  static toDomain(entity: TUserAccountPrisma): UserAccount {
    return UserAccount.register({
      user_id: entity.user.id,
      email: entity.email,
      password: entity.password,
      password_need_reset: entity.password_need_reset,
      status: entity.user.status,
      deleted_at: entity.user.deleted_at,
    });
  }
}
