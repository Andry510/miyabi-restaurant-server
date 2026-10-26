//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { Product } from '../../entities';
import type { TApplySyncInput } from '../../types/services';

export interface IProductRepository {
  findSyncedAt(): Promise<ResultPattern<Date | null>>;

  applySync(input: TApplySyncInput): Promise<ResultPattern<void>>;

  upsert(product: Product): Promise<ResultPattern<void>>;

  removeByCloudId(cloudId: string): Promise<ResultPattern<void>>;
}
