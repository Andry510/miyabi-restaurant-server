import type {
  authentications,
  job_positions,
  profiles,
  user_assignments,
  users,
  work_areas,
} from '@generated/prisma/client';

//Domain
import { UserAggregate } from '../../../domain/aggregates';

type TUserSessionRow = Pick<authentications, 'email' | 'phone_number'> & {
  user: Pick<users, 'id' | 'status'> & {
    profile: Pick<profiles, 'first_name' | 'last_name'> | null;
    assignments: Array<
      Pick<user_assignments, 'id'> & {
        area_job_position: {
          work_area: Pick<work_areas, 'id' | 'name'>;
          job_position: Pick<job_positions, 'id' | 'name'>;
        };
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
            work_area: { ...assignment.area_job_position.work_area },
            job_position: { ...assignment.area_job_position.job_position },
          }
        : null,
    });
  }
}
