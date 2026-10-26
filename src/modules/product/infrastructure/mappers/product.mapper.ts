import type { products } from '@generated/prisma/client';

//Domain
import type { TLocalProductOutput } from '../../domain/types/entities';

type TLocalProductRow = Pick<
  products,
  'id' | 'name' | 'picture' | 'barcode' | 'storage_code' | 'unit'
>;

export class ProductMapper {
  static toOutput = (product: TLocalProductRow): TLocalProductOutput => ({
    id: product.id,
    name: product.name,
    picture: product.picture,
    barcode: product.barcode,
    storage_code: product.storage_code,
    unit: product.unit,
  });
}
