//Domain
import type { PRODUCT_UNIT } from '@domain/enums/shared';

export type TProductProps = {
  cloud_id: string;
  name: string;
  description: string | null;
  picture: string | null;
  barcode: string | null;
  storage_code: string;
  unit: PRODUCT_UNIT;
  status: boolean;
  cloud_updated_at: Date;
};

export type TProductOutput = TProductProps;
