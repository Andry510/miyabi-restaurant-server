import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import { AttendanceAggregate } from '../../domain/aggregates';
import type {
  IAttendanceRepository,
  IUserRepository,
} from '../../domain/interfaces/repositories';
import type { IAttendanceService } from '../../domain/interfaces/services';
import type { TAttendanceQuerySchema } from '../../domain/schemas';
import type { TAttendanceOutput } from '../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  USER_LOGGER_NAME,
  USER_PROVIDER_TOKENS,
} from '../../infrastructure/constants';

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger = new Logger(USER_LOGGER_NAME.SERVICES.ATTENDANCE);

  constructor(
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.USER)
    private readonly user_repository: IUserRepository,
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.ATTENDANCE)
    private readonly attendance_repository: IAttendanceRepository,
  ) {}

  async attendance(
    userId: string,
    input: TAttendanceQuerySchema,
  ): Promise<ResultPattern<TAttendanceOutput, ServiceError>> {
    const [existResult, timezoneResult] = await Promise.all([
      this.user_repository.doesExistById(userId),
      this.attendance_repository.findTimezone(),
    ]);

    if (existResult.IsFailure || timezoneResult.IsFailure) {
      this.logger.error(existResult.Error ?? timezoneResult.Error ?? '');
      return ServiceResultMapper.InternalServerError();
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    const timezone = timezoneResult.Value;

    const shiftsResult = await this.attendance_repository.findShiftsByUser(
      userId,
      TimeZone.startOfDay(input.from, timezone),
      TimeZone.startOfNextDay(input.to, timezone),
    );

    if (shiftsResult.IsFailure) {
      this.logger.error(shiftsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(
      AttendanceAggregate.register(input.from, input.to, shiftsResult.Value)
        .Output,
    );
  }
}
