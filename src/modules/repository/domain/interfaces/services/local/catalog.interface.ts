//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';

export interface ICatalogService {
  workAreasExist(ids: string[]): Promise<ResultPattern<boolean, ServiceError>>;

  jobPositionsExist(
    ids: string[],
  ): Promise<ResultPattern<boolean, ServiceError>>;

  productsExist(ids: string[]): Promise<ResultPattern<boolean, ServiceError>>;
}
