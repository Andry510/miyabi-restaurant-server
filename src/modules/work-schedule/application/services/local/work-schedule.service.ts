import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_WORK_SCHEDULE_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IWorkScheduleRepository } from '../../../domain/interfaces/repositories';
import type { IWorkScheduleService } from '../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TWorkSchedulesQuerySchema,
} from '../../../domain/schemas';
import type { TWorkScheduleOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  WORK_SCHEDULE_LOGGER_NAME,
  WORK_SCHEDULE_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class WorkScheduleService implements IWorkScheduleService {
  private readonly logger = new Logger(
    WORK_SCHEDULE_LOGGER_NAME.SERVICE.WORK_SCHEDULE,
  );

  constructor(
    @Inject(WORK_SCHEDULE_PROVIDER_TOKENS.REPOSITORIES.WORK_SCHEDULE)
    private readonly work_schedule_repository: IWorkScheduleRepository,
  ) {}

  async workSchedules(
    input: TWorkSchedulesQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TWorkScheduleOutput>, ServiceError>
  > {
    const listResult = await this.work_schedule_repository.findMany(input);

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async workSchedule(
    id: string,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>> {
    const findResult = await this.work_schedule_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(
        API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(findResult.Value);
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>> {
    const createResult = await this.work_schedule_repository.create(input);

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(createResult.Value);
  }

  async update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>> {
    const updateResult = await this.work_schedule_repository.update({
      ...input,
      id,
    });

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.NotFound(
        API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(updateResult.Value);
  }

  async remove(id: string): Promise<ResultPattern<null, ServiceError>> {
    const removeResult = await this.work_schedule_repository.softDelete(id);

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (removeResult.Value === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
      );
    }

    if (removeResult.Value === 'has_scheduled_shifts') {
      return ServiceResultMapper.Conflict(
        API_WORK_SCHEDULE_MESSAGE.ERROR.HAS_SCHEDULED_SHIFTS,
      );
    }

    return ServiceResultMapper.Ok(null);
  }
}
