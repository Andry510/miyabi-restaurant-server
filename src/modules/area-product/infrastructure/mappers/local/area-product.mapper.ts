import type { products, work_areas } from '@generated/prisma/client';

//Domain
import type {
  TAreaProductOutput,
  TProductAreaOutput,
} from '../../../domain/types/entities';

type TProductRow = Pick<
  products,
  'id' | 'name' | 'picture' | 'barcode' | 'storage_code' | 'unit' | 'status'
>;

type TWorkAreaRow = Pick<work_areas, 'id' | 'name' | 'description' | 'status'>;

export class AreaProductMapper {
  static toProductOutput = (row: TProductRow): TAreaProductOutput => ({
    ...row,
  });

  static toWorkAreaOutput = (row: TWorkAreaRow): TProductAreaOutput => ({
    ...row,
  });
}
