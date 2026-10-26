import type {
  area_job_positions,
  authentications,
  profiles,
  user_assignments,
  users,
} from '@generated/prisma/client';

//Domain
import { UserAggregate } from '../../domain/aggregates';

type TUserSessionRow = Pick<authentications, 'email' | 'phone_number'> & {
  user: Pick<users, 'id' | 'status'> & {
    profile: Pick<profiles, 'first_name' | 'last_name'> | null;
    assignments: Array<
      Pick<user_assignments, 'id'> & {
        area_job_position: Pick<
          area_job_positions,
          'work_area_id' | 'job_position_id'
        >;
      }
    >;
  };
};

export class UserMapper {
  static toDomain(entity: TUserSessionRow): UserAggregate {
    const { user } = entity;
    const assignment = user.assignments.at(0);

    return UserAggregate.register({
      id: user.id,
      status: user.status,
      first_name: user.profile?.first_name ?? '',
      last_name: user.profile?.last_name ?? '',
      email: entity.email,
      phone_number: entity.phone_number,
      assignment: assignment
        ? {
            id: assignment.id,
            work_area_id: assignment.area_job_position.work_area_id,
            job_position_id: assignment.area_job_position.job_position_id,
          }
        : null,
    });
  }
}
