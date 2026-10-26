import type { work_areas } from '@generated/prisma/client';

//Domain
import type { TWorkAreaOutput } from '../../../domain/types/entities';

type TWorkAreaRow = Pick<
  work_areas,
  'id' | 'name' | 'description' | 'status' | 'created_at' | 'updated_at'
>;

export class WorkAreaMapper {
  static toOutput = (row: TWorkAreaRow): TWorkAreaOutput => ({ ...row });
}
