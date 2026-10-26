import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_AREA_JOB_POSITION_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IAreaJobPositionRepository } from '../../../domain/interfaces/repositories';
import type { IWorkAreaService } from '../../../domain/interfaces/services';
import type { TLinksQuerySchema } from '../../../domain/schemas';
import type {
  TLinkedOutput,
  TLinkedUserOutput,
} from '../../../domain/types/entities';
import type { TLinkPair } from '../../../domain/types/repositories';
import type { ICatalogService } from '../../../../repository/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  AREA_JOB_POSITION_LOGGER_NAME,
  AREA_JOB_POSITION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

@Injectable()
export class WorkAreaService implements IWorkAreaService {
  private readonly logger = new Logger(
    AREA_JOB_POSITION_LOGGER_NAME.SERVICE.WORK_AREA,
  );

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG)
    private readonly catalog_service: ICatalogService,
    @Inject(AREA_JOB_POSITION_PROVIDER_TOKENS.REPOSITORIES.AREA_JOB_POSITION)
    private readonly area_job_position_repository: IAreaJobPositionRepository,
  ) {}

  //<--------- Validations --------->

  private async validateExists(
    id: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    const existResult = await this.catalog_service.workAreasExist([id]);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_AREA_JOB_POSITION_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  //<--------- Service --------->

  async jobPositions(
    id: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TLinkedOutput>, ServiceError>> {
    const [existResult, listResult] = await Promise.all([
      this.validateExists(id),
      this.area_job_position_repository.findJobPositionsByWorkArea(id, input),
    ]);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async assign(
    id: string,
    ids: string[],
  ): Promise<ResultPattern<null, ServiceError>> {
    const [existResult, othersResult] = await Promise.all([
      this.validateExists(id),
      this.catalog_service.jobPositionsExist(ids),
    ]);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (othersResult.IsFailure) {
      return ResultPattern.Failure(othersResult.Error);
    }

    if (!othersResult.Value) {
      return ServiceResultMapper.NotFound(
        API_AREA_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
      );
    }

    const linkResult = await this.area_job_position_repository.link(
      this.pairs(id, ids),
    );

    if (linkResult.IsFailure) {
      this.logger.error(linkResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(null);
  }

  async remove(
    id: string,
    ids: string[],
  ): Promise<ResultPattern<null, ServiceError>> {
    const existResult = await this.validateExists(id);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    const unlinkResult = await this.area_job_position_repository.unlink(
      this.pairs(id, ids),
    );

    if (unlinkResult.IsFailure) {
      this.logger.error(unlinkResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (unlinkResult.Value === 'not_linked') {
      return ServiceResultMapper.NotFound(
        API_AREA_JOB_POSITION_MESSAGE.ERROR.NOT_LINKED,
      );
    }

    if (unlinkResult.Value === 'has_employees') {
      return ServiceResultMapper.Conflict(
        API_AREA_JOB_POSITION_MESSAGE.ERROR.HAS_EMPLOYEES,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  async users(
    id: string,
    input: TLinksQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TLinkedUserOutput>, ServiceError>
  > {
    const [existResult, usersResult] = await Promise.all([
      this.validateExists(id),
      this.area_job_position_repository.findUsers({ work_area_id: id }, input),
    ]);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (usersResult.IsFailure) {
      this.logger.error(usersResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = usersResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  //Functions
  private pairs(id: string, ids: string[]): TLinkPair[] {
    return ids.map((otherId) => ({
      work_area_id: id,
      job_position_id: otherId,
    }));
  }
}
