import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_ME_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { ILocalUserRepository } from '../../../domain/interfaces/repositories';
import type { ILocalUserService } from '../../../domain/interfaces/services';
import type {
  TChangePasswordBodySchema,
  TUpdateProfileBodySchema,
} from '../../../domain/schemas';
import type { TLocalUserOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { SESSION_REVOCATION_ACTOR } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Argon2 } from '@infrastructure/securities';
import {
  ME_LOGGER_NAME,
  ME_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class LocalUserService implements ILocalUserService {
  private readonly logger = new Logger(ME_LOGGER_NAME.SERVICES.LOCAL);

  constructor(
    @Inject(ME_PROVIDER_TOKENS.REPOSITORIES.LOCAL_USER)
    private readonly user_repository: ILocalUserRepository,
  ) {}

  user(user: TUserDetail): ResultPattern<TLocalUserOutput, ServiceError> {
    return ServiceResultMapper.Ok({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      status: user.status,
      work_area: user.assignment?.work_area ?? null,
      job_position: user.assignment?.job_position ?? null,
    });
  }

  async updateProfile(
    user: TUserDetail,
    input: TUpdateProfileBodySchema,
  ): Promise<ResultPattern<TLocalUserOutput, ServiceError>> {
    const updateResult = await this.user_repository.updatePhoneNumber(
      user.id,
      input.phone_number,
    );

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.Conflict(
        API_ME_MESSAGE.ERROR.PHONE_NUMBER_ALREADY_IN_USE,
      );
    }

    return this.user({ ...user, phone_number: input.phone_number });
  }

  async changePassword(
    userId: string,
    input: TChangePasswordBodySchema,
  ): Promise<ResultPattern<null, ServiceError>> {
    const hashResult = await this.user_repository.findPasswordHash(userId);

    if (hashResult.IsFailure) {
      this.logger.error(hashResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!hashResult.Value) {
      return ServiceResultMapper.Unauthorized();
    }

    const matchResult = await Argon2.verify(
      hashResult.Value,
      input.current_password,
    );

    if (matchResult.IsFailure) {
      this.logger.error(matchResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!matchResult.Value) {
      return ServiceResultMapper.BadRequest(
        API_ME_MESSAGE.ERROR.INVALID_CURRENT_PASSWORD,
      );
    }

    const newHashResult = await Argon2.hash(input.new_password);

    if (newHashResult.IsFailure) {
      this.logger.error(newHashResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const updateResult = await this.user_repository.updatePassword(
      userId,
      newHashResult.Value,
      SESSION_REVOCATION_ACTOR.USER(userId),
    );

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(null);
  }
}
