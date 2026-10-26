import type {
  authentications,
  job_positions,
  profiles,
  users,
  work_areas,
} from '@generated/prisma/client';

//Domain
import type { TUserOutput, TUsersOutput } from '../../domain/types/entities';

type TUserRow = Pick<users, 'id' | 'status' | 'created_at' | 'updated_at'> & {
  profile: Pick<profiles, 'first_name' | 'last_name'> | null;
  authentication: Pick<
    authentications,
    'email' | 'phone_number' | 'password_need_reset'
  > | null;
  assignments: Array<{
    area_job_position: {
      work_area: Pick<work_areas, 'id' | 'name'>;
      job_position: Pick<job_positions, 'id' | 'name'>;
    };
  }>;
};

export class UserMapper {
  static toUsersOutput = (row: TUserRow): TUsersOutput => {
    const assignment = row.assignments.at(0)?.area_job_position;

    return {
      id: row.id,
      first_name: row.profile?.first_name ?? '',
      last_name: row.profile?.last_name ?? '',
      email: row.authentication?.email ?? '',
      phone_number: row.authentication?.phone_number ?? null,
      status: row.status,
      work_area: assignment ? { ...assignment.work_area } : null,
      job_position: assignment ? { ...assignment.job_position } : null,
    };
  };

  static toOutput = (row: TUserRow): TUserOutput => ({
    ...UserMapper.toUsersOutput(row),
    password_need_reset: row.authentication?.password_need_reset ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}
