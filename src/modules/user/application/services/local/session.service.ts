import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  ISessionRepository,
  IUserRepository,
} from '../../../domain/interfaces/repositories';
import type { ISessionService } from '../../../domain/interfaces/services';
import type { TSessionsQuerySchema } from '../../../domain/schemas';
import type { TSessionOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  USER_LOGGER_NAME,
  USER_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

@Injectable()
export class SessionService implements ISessionService {
  private readonly logger = new Logger(USER_LOGGER_NAME.SERVICES.SESSION);

  constructor(
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.USER)
    private readonly user_repository: IUserRepository,
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.SESSION)
    private readonly session_repository: ISessionRepository,
  ) {}

  async sessions(
    userId: string,
    input: TSessionsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TSessionOutput>, ServiceError>> {
    const [existResult, sessionsResult] = await Promise.all([
      this.user_repository.doesExistById(userId),
      this.session_repository.findManyByUser(userId, input),
    ]);

    if (existResult.IsFailure || sessionsResult.IsFailure) {
      this.logger.error(existResult.Error ?? sessionsResult.Error ?? '');
      return ServiceResultMapper.InternalServerError();
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    const { count, data } = sessionsResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }
}
