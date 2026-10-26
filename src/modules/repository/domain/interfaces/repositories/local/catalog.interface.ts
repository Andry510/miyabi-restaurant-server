//Domain
import type { ResultPattern } from '@domain/patterns/results';

export interface ICatalogRepository {
  countWorkAreas(ids: string[]): Promise<ResultPattern<number>>;

  countJobPositions(ids: string[]): Promise<ResultPattern<number>>;

  countProducts(ids: string[]): Promise<ResultPattern<number>>;
}
