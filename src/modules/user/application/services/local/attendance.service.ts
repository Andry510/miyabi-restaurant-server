import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import { AttendanceAggregate } from '../../../domain/aggregates';
import type {
  IAttendanceRepository,
  IUserRepository,
} from '../../../domain/interfaces/repositories';
import type { IAttendanceService } from '../../../domain/interfaces/services';
import type { TAttendanceQuerySchema } from '../../../domain/schemas';
import type { TAttendanceOutput } from '../../../domain/types/entities';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  USER_LOGGER_NAME,
  USER_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger = new Logger(USER_LOGGER_NAME.SERVICES.ATTENDANCE);

  constructor(
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.USER)
    private readonly user_repository: IUserRepository,
    @Inject(USER_PROVIDER_TOKENS.REPOSITORIES.ATTENDANCE)
    private readonly attendance_repository: IAttendanceRepository,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
  ) {}

  async attendance(
    userId: string,
    input: TAttendanceQuerySchema,
  ): Promise<ResultPattern<TAttendanceOutput, ServiceError>> {
    const [existResult, settingsResult] = await Promise.all([
      this.user_repository.doesExistById(userId),
      this.setting_service.settings(),
    ]);

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    if (existResult.IsFailure) {
      this.logger.error(existResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
      );
    }

    return this.agenda(userId, input, settingsResult.Value.timezone);
  }

  async mine(
    user: TUserDetail,
    input: TAttendanceQuerySchema,
  ): Promise<ResultPattern<TAttendanceOutput, ServiceError>> {
    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    return this.agenda(user.id, input, settingsResult.Value.timezone);
  }

  //Functions
  private async agenda(
    userId: string,
    input: TAttendanceQuerySchema,
    timezone: string,
  ): Promise<ResultPattern<TAttendanceOutput, ServiceError>> {
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
      AttendanceAggregate.register(
        input.from,
        input.to,
        timezone,
        new Date(),
        shiftsResult.Value,
      ).Output,
    );
  }
}
