import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IUserRepository } from '../../domain/interfaces/repositories';
import type { IUserService } from '../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TUsersQuerySchema,
} from '../../domain/schemas';
import type { TUserOutput, TUsersOutput } from '../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { SESSION_REVOCATION_ACTOR } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Argon2 } from '@infrastructure/securities';
import {
  USER_LOGGER_NAME,
  USER_PROVIDER_TOKENS,
} from '../../infrastructure/constants';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(USER_LOGGER_NAME.SERVICES.USER);

  constructor(
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.USER)
    private readonly user_repository: IUserRepository,
  ) {}

  //<--------- Validations --------->

  private async validateConflicts(
    email: string | null,
    phoneNumber: string | null,
    exceptUserId: string | null,
  ): Promise<ResultPattern<null, ServiceError>> {
    const conflictsResult = await this.user_repository.findConflicts(
      email,
      phoneNumber,
      exceptUserId,
    );

    if (conflictsResult.IsFailure) {
      this.logger.error(conflictsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (conflictsResult.Value.email) {
      return ServiceResultMapper.Conflict(
        API_USER_MESSAGE.ERROR.EMAIL_ALREADY_IN_USE,
      );
    }

    if (conflictsResult.Value.phone_number) {
      return ServiceResultMapper.Conflict(
        API_USER_MESSAGE.ERROR.PHONE_NUMBER_ALREADY_IN_USE,
      );
    }

    return ServiceResultMapper.Ok(null);
  }

  private async resolveAreaJobPosition(
    workAreaId: string | undefined,
    jobPositionId: string | undefined,
  ): Promise<ResultPattern<string | null, ServiceError>> {
    if (!workAreaId || !jobPositionId) {
      return ServiceResultMapper.Ok(null);
    }

    const areaResult = await this.user_repository.findAreaJobPositionId(
      workAreaId,
      jobPositionId,
    );

    if (areaResult.IsFailure) {
      this.logger.error(areaResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!areaResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.AREA_JOB_POSITION_NOT_EXIST,
      );
    }

    return ServiceResultMapper.Ok(areaResult.Value);
  }

  //<--------- Service --------->

  async users(
    input: TUsersQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TUsersOutput>, ServiceError>> {
    const usersResult = await this.user_repository.findMany(input);

    if (usersResult.IsFailure) {
      this.logger.error(usersResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = usersResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async user(id: string): Promise<ResultPattern<TUserOutput, ServiceError>> {
    const userResult = await this.user_repository.findById(id);

    if (userResult.IsFailure) {
      this.logger.error(userResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!userResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    return ServiceResultMapper.Ok(userResult.Value);
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TUserOutput, ServiceError>> {
    const [conflictsResult, areaResult, hashResult] = await Promise.all([
      this.validateConflicts(input.email, input.phone_number ?? null, null),
      this.resolveAreaJobPosition(input.work_area_id, input.job_position_id),
      Argon2.hash(input.password),
    ]);

    if (conflictsResult.IsFailure) {
      return ResultPattern.Failure(conflictsResult.Error);
    }

    if (areaResult.IsFailure) {
      return ResultPattern.Failure(areaResult.Error);
    }

    if (hashResult.IsFailure) {
      this.logger.error(hashResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const createResult = await this.user_repository.create({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone_number: input.phone_number,
      password_hash: hashResult.Value,
      area_job_position_id: areaResult.Value,
    });

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(createResult.Value);
  }

  async update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TUserOutput, ServiceError>> {
    const [conflictsResult, areaResult] = await Promise.all([
      this.validateConflicts(
        input.email ?? null,
        input.phone_number ?? null,
        id,
      ),
      this.resolveAreaJobPosition(input.work_area_id, input.job_position_id),
    ]);

    if (conflictsResult.IsFailure) {
      return ResultPattern.Failure(conflictsResult.Error);
    }

    if (areaResult.IsFailure) {
      return ResultPattern.Failure(areaResult.Error);
    }

    const updateResult = await this.user_repository.update({
      id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone_number: input.phone_number,
      status: input.status,
      reset_password: input.reset_password,
      area_job_position_id: areaResult.Value,
      revoke_sessions_by:
        input.status === false || input.reset_password === true
          ? SESSION_REVOCATION_ACTOR.MANAGER
          : null,
    });

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    return ServiceResultMapper.Ok(updateResult.Value);
  }

  async remove(id: string): Promise<ResultPattern<null, ServiceError>> {
    const deleteResult = await this.user_repository.softDelete(
      id,
      SESSION_REVOCATION_ACTOR.MANAGER,
    );

    if (deleteResult.IsFailure) {
      this.logger.error(deleteResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!deleteResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    return ServiceResultMapper.Ok(null);
  }
}
