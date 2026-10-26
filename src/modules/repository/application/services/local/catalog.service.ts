import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICatalogRepository } from '../../../domain/interfaces/repositories';
import type { ICatalogService } from '../../../domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  REPOSITORY_LOGGER_NAME,
  REPOSITORY_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class CatalogService implements ICatalogService {
  private readonly logger = new Logger(REPOSITORY_LOGGER_NAME.SERVICE.CATALOG);

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.CATALOG)
    private readonly catalog_repository: ICatalogRepository,
  ) {}

  workAreasExist(ids: string[]): Promise<ResultPattern<boolean, ServiceError>> {
    return this.allExist(ids, (list) =>
      this.catalog_repository.countWorkAreas(list),
    );
  }

  jobPositionsExist(
    ids: string[],
  ): Promise<ResultPattern<boolean, ServiceError>> {
    return this.allExist(ids, (list) =>
      this.catalog_repository.countJobPositions(list),
    );
  }

  productsExist(ids: string[]): Promise<ResultPattern<boolean, ServiceError>> {
    return this.allExist(ids, (list) =>
      this.catalog_repository.countProducts(list),
    );
  }

  //Functions
  private async allExist(
    ids: string[],
    count: (ids: string[]) => Promise<ResultPattern<number>>,
  ): Promise<ResultPattern<boolean, ServiceError>> {
    if (ids.length === 0) {
      return ServiceResultMapper.Ok(true);
    }

    const countResult = await count(ids);

    if (countResult.IsFailure) {
      this.logger.error(countResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(countResult.Value === ids.length);
  }
}
