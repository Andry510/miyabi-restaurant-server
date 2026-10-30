import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_CHECK_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { ICheckRepository } from '../../../domain/interfaces/repositories';
import type { ICheckService } from '../../../domain/interfaces/services';
import type { TCheckOutput } from '../../../domain/types/entities';
import type { TCheckCandidate } from '../../../domain/types/repositories';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { AttendanceRule, Duration } from '@infrastructure/utils';
import { CHECK_OUT_GRACE_MINUTES } from '@infrastructure/constants';
import {
  CHECK_LOGGER_NAME,
  CHECK_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

const GRACE_MS = CHECK_OUT_GRACE_MINUTES * Duration.MINUTE_MS;

type TCheckSituation = {
  now: Date;
  window_ms: number;
  open: TCheckCandidate | null;
  next: TCheckCandidate | null;
};

@Injectable()
export class CheckService implements ICheckService {
  private readonly logger = new Logger(CHECK_LOGGER_NAME.SERVICE.CHECK);

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(CHECK_PROVIDER_TOKENS.REPOSITORIES.CHECK)
    private readonly check_repository: ICheckRepository,
  ) {}

  //<--------- Validations --------->

  private async situation(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckSituation, ServiceError>> {
    const now = new Date();
    const assignmentId = user.assignment?.id;

    const [settingsResult, candidatesResult] = await Promise.all([
      this.setting_service.settings(),
      assignmentId
        ? this.check_repository.findCandidates(
            assignmentId,
            new Date(now.getTime() - GRACE_MS),
          )
        : ResultPattern.Success<TCheckCandidate[]>([]),
    ]);

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    if (candidatesResult.IsFailure) {
      this.logger.error(candidatesResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const candidates = candidatesResult.Value;

    return ServiceResultMapper.Ok({
      now,
      window_ms:
        settingsResult.Value.clock_in_window_minutes * Duration.MINUTE_MS,
      open: candidates.find((shift) => shift.attendance_record) ?? null,
      next:
        candidates.find(
          (shift) => !shift.attendance_record && shift.scheduled_end > now,
        ) ?? null,
    });
  }

  //<--------- Service --------->

  async current(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput | null, ServiceError>> {
    const situationResult = await this.situation(user);

    if (situationResult.IsFailure) {
      return ResultPattern.Failure(situationResult.Error);
    }

    const { open, next, window_ms } = situationResult.Value;
    const shift = open ?? next;

    return ServiceResultMapper.Ok(
      shift
        ? this.toOutput(shift, shift.attendance_record, window_ms, {
            late_minutes: shift.attendance_record?.clock_in
              ? this.lateMinutes(shift, shift.attendance_record.clock_in)
              : null,
          })
        : null,
    );
  }

  async checkIn(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput, ServiceError>> {
    const situationResult = await this.situation(user);

    if (situationResult.IsFailure) {
      return ResultPattern.Failure(situationResult.Error);
    }

    const { now, open, next, window_ms } = situationResult.Value;

    if (open) {
      return ServiceResultMapper.Conflict(
        API_CHECK_MESSAGE.ERROR.ALREADY_CHECKED_IN,
      );
    }

    if (!next) {
      return ServiceResultMapper.NotFound(API_CHECK_MESSAGE.ERROR.NO_SHIFT);
    }

    if (now.getTime() < next.scheduled_start.getTime() - window_ms) {
      return ServiceResultMapper.Conflict(API_CHECK_MESSAGE.ERROR.TOO_EARLY);
    }

    const lateMinutes = this.lateMinutes(next, now);

    const checkInResult = await this.check_repository.checkIn({
      shift_id: next.id,
      user_id: user.id,
      clock_in: now,
      late_minutes: lateMinutes,
    });

    if (checkInResult.IsFailure) {
      this.logger.error(checkInResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!checkInResult.Value) {
      return ServiceResultMapper.Conflict(
        API_CHECK_MESSAGE.ERROR.ALREADY_CHECKED_IN,
      );
    }

    return ServiceResultMapper.Ok(
      this.toOutput(next, { clock_in: now, clock_out: null }, window_ms, {
        late_minutes: lateMinutes,
      }),
    );
  }

  async checkOut(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput, ServiceError>> {
    const situationResult = await this.situation(user);

    if (situationResult.IsFailure) {
      return ResultPattern.Failure(situationResult.Error);
    }

    const { now, open, window_ms } = situationResult.Value;
    const record = open?.attendance_record;

    if (!open || !record) {
      return ServiceResultMapper.Conflict(
        API_CHECK_MESSAGE.ERROR.NOT_CHECKED_IN,
      );
    }

    const earlyMinutes = AttendanceRule.earlyMinutes(
      now,
      open.scheduled_end,
      open.work_schedule.early_leave_tolerance_minutes,
    );

    const checkOutResult = await this.check_repository.checkOut({
      record_id: record.id,
      shift_id: open.id,
      clock_out: now,
      early_departure_minutes: earlyMinutes,
    });

    if (checkOutResult.IsFailure) {
      this.logger.error(checkOutResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!checkOutResult.Value) {
      return ServiceResultMapper.Conflict(
        API_CHECK_MESSAGE.ERROR.NOT_CHECKED_IN,
      );
    }

    return ServiceResultMapper.Ok(
      this.toOutput(
        open,
        { clock_in: record.clock_in, clock_out: now },
        window_ms,
        { early_departure_minutes: earlyMinutes },
      ),
    );
  }

  //Functions
  private lateMinutes(shift: TCheckCandidate, clockIn: Date): number | null {
    return AttendanceRule.lateMinutes(
      shift.scheduled_start,
      clockIn,
      shift.work_schedule.late_tolerance_minutes,
    );
  }

  private toOutput(
    shift: TCheckCandidate,
    record: { clock_in: Date | null; clock_out: Date | null } | null,
    windowMs: number,
    incidents: Partial<
      Pick<TCheckOutput, 'late_minutes' | 'early_departure_minutes'>
    > | null,
  ): TCheckOutput {
    return {
      shift: {
        id: shift.id,
        work_schedule: {
          id: shift.work_schedule.id,
          name: shift.work_schedule.name,
        },
        scheduled_start: shift.scheduled_start,
        scheduled_end: shift.scheduled_end,
      },
      state: !record
        ? 'pending'
        : record.clock_out
          ? 'completed'
          : 'checked_in',
      clock_in: record?.clock_in ?? null,
      clock_out: record?.clock_out ?? null,
      check_in_from: new Date(shift.scheduled_start.getTime() - windowMs),
      check_out_until: new Date(shift.scheduled_end.getTime() + GRACE_MS),
      late_minutes: incidents?.late_minutes ?? null,
      early_departure_minutes: incidents?.early_departure_minutes ?? null,
    };
  }
}
