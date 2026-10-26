import { Inject, Injectable } from '@nestjs/common';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { TPaginationService } from '@domain/types/shared';
import type { IProductRepository } from '../../../domain/interfaces/repositories';
import type { ILocalService } from '../../../domain/interfaces/services';
import type { TLocalProductsQuerySchema } from '../../../domain/schemas';
import type { TLocalProductOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  PRODUCT_LOGGER_NAME,
  PRODUCT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class LocalService implements ILocalService {
  private readonly logger = new Logger(PRODUCT_LOGGER_NAME.SERVICE.LOCAL);

  constructor(
    @Inject(PRODUCT_PROVIDER_TOKENS.REPOSITORIES.PRODUCT)
    private readonly product_repository: IProductRepository,
  ) {}

  async products(
    input: TLocalProductsQuerySchema,
    user: TUserDetail,
  ): Promise<
    ResultPattern<TPaginationService<TLocalProductOutput>, ServiceError>
  > {
    if (!user.assignment) {
      return ServiceResultMapper.Forbidden(
        API_MESSAGE_GLOBAL.ERROR.USER_WITHOUT_ASSIGNMENT,
      );
    }

    const productsResult = await this.product_repository.findManyByWorkArea(
      input,
      user.assignment.work_area.id,
    );

    if (productsResult.IsFailure) {
      this.logger.error(productsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = productsResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }
}
