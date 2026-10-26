import type {
  authentications,
  job_positions,
  profiles,
  users,
  work_areas,
} from '@generated/prisma/client';

//Domain
import type {
  TLinkedOutput,
  TLinkedUserOutput,
} from '../../../domain/types/entities';

type TLinkedRow = Pick<
  work_areas | job_positions,
  'id' | 'name' | 'description' | 'status'
>;

type TUserRow = Pick<users, 'id' | 'status'> & {
  profile: Pick<profiles, 'first_name' | 'last_name'> | null;
  authentication: Pick<authentications, 'email'> | null;
  assignments: Array<{
    area_job_position: {
      work_area: Pick<work_areas, 'id' | 'name'>;
      job_position: Pick<job_positions, 'id' | 'name'>;
    };
  }>;
};

export class AreaJobPositionMapper {
  static toLinkedOutput = (row: TLinkedRow): TLinkedOutput => ({ ...row });

  static toUserOutput = (row: TUserRow): TLinkedUserOutput | null => {
    const link = row.assignments.at(0)?.area_job_position;

    if (!link) {
      return null;
    }

    return {
      id: row.id,
      first_name: row.profile?.first_name ?? '',
      last_name: row.profile?.last_name ?? '',
      email: row.authentication?.email ?? '',
      status: row.status,
      work_area: { ...link.work_area },
      job_position: { ...link.job_position },
    };
  };
}
