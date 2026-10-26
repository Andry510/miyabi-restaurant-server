//Domain
import type { Product } from '../../entities';

export type TApplySyncInput = {
  products: Product[];
  removed_ids: string[];
  synced_at: Date;
};
