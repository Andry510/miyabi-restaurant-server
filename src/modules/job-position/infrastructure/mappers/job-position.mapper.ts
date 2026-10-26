import type { job_positions } from '@generated/prisma/client';

//Domain
import type { TJobPositionOutput } from '../../domain/types/entities';

type TJobPositionRow = Pick<
  job_positions,
  'id' | 'name' | 'description' | 'status' | 'created_at' | 'updated_at'
>;

export class JobPositionMapper {
  static toOutput = (row: TJobPositionRow): TJobPositionOutput => ({ ...row });
}
