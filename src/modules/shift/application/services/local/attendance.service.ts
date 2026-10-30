import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { INCIDENT_TYPE } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type {
  IAttendanceRepository,
  IShiftRepository,
} from '../../../domain/interfaces/repositories';
import type { IAttendanceService } from '../../../domain/interfaces/services';
import type {
  TCorrectAttendanceBodySchema,
  TJustifyBodySchema,
} from '../../../domain/schemas';
import type { TShiftOutput } from '../../../domain/types/entities';
import type { TShiftAttendance } from '../../../domain/types/repositories';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { AttendanceRule, Duration, TokenPayload } from '@infrastructure/utils';
import {
  SHIFT_LOGGER_NAME,
  SHIFT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

const CLOCK_MARGIN_MS = 12 * 60 * Duration.MINUTE_MS;

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger = new Logger(SHIFT_LOGGER_NAME.SERVICE.ATTENDANCE);

  constructor(
    @Inject(SHIFT_PROVIDER_TOKENS.REPOSITORIES.ATTENDANCE)
    private readonly attendance_repository: IAttendanceRepository,
    @Inject(SHIFT_PROVIDER_TOKENS.REPOSITORIES.SHIFT)
    private readonly shift_repository: IShiftRepository,
  ) {}

  //<--------- Validations --------->

  private async validateShift(
    id: string,
  ): Promise<ResultPattern<TShiftAttendance, ServiceError>> {
    const shiftResult = await this.attendance_repository.findAttendance(id);

    if (shiftResult.IsFailure) {
      this.logger.error(shiftResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const shift = shiftResult.Value;

    if (!shift) {
      return ServiceResultMapper.NotFound(
        API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
      );
    }

    if (shift.cancelled) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.CANCELLED);
    }

    if (shift.in_closed_tip_pool) {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.TIP_POOL_CLOSED,
      );
    }

    return ServiceResultMapper.Ok(shift);
  }

  //<--------- Service --------->

  async correct(
    id: string,
    input: TCorrectAttendanceBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const shiftResult = await this.validateShift(id);

    if (shiftResult.IsFailure) {
      return ResultPattern.Failure(shiftResult.Error);
    }

    const shift = shiftResult.Value;
    const now = new Date();

    if (shift.scheduled_start > now) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NOT_STARTED);
    }

    const clockIn = input.clock_in ?? shift.record?.clock_in ?? null;
    const clockOut = input.clock_out ?? shift.record?.clock_out ?? null;

    if (!clockIn) {
      return ServiceResultMapper.BadRequest(
        API_SHIFT_MESSAGE.ERROR.CLOCK_IN_REQUIRED,
      );
    }

    const earliest = shift.scheduled_start.getTime() - CLOCK_MARGIN_MS;
    const latest = shift.scheduled_end.getTime() + CLOCK_MARGIN_MS;
    const invalid =
      clockIn.getTime() < earliest ||
      clockIn > now ||
      (clockOut !== null &&
        (clockOut <= clockIn || clockOut > now || clockOut.getTime() > latest));

    if (invalid) {
      return ServiceResultMapper.BadRequest(
        API_SHIFT_MESSAGE.ERROR.INVALID_TIMES,
      );
    }

    const correctResult = await this.attendance_repository.correct({
      shift_id: id,
      clock_in: clockIn,
      clock_out: clockOut,
      late_minutes: AttendanceRule.lateMinutes(
        shift.scheduled_start,
        clockIn,
        shift.late_tolerance_minutes,
      ),
      early_departure_minutes: clockOut
        ? AttendanceRule.earlyMinutes(
            clockOut,
            shift.scheduled_end,
            shift.early_leave_tolerance_minutes,
          )
        : null,
      reason: input.reason,
      corrected_by: TokenPayload.email(accessToken),
    });

    if (correctResult.IsFailure) {
      this.logger.error(correctResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return this.shift(id);
  }

  async justify(
    id: string,
    input: TJustifyBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const shiftResult = await this.validateShift(id);

    if (shiftResult.IsFailure) {
      return ResultPattern.Failure(shiftResult.Error);
    }

    const shift = shiftResult.Value;
    const justification = {
      shift_id: id,
      type: input.type,
      reason: input.reason,
      justified_by: TokenPayload.email(accessToken),
    };
    const incident = shift.record?.incidents.find(
      (item) => item.type === input.type,
    );

    if (incident?.justified) {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.ALREADY_JUSTIFIED,
      );
    }

    if (input.type === INCIDENT_TYPE.ABSENCE) {
      if (shift.scheduled_end > new Date()) {
        return ServiceResultMapper.Conflict(
          API_SHIFT_MESSAGE.ERROR.NOT_FINISHED,
        );
      }

      if (shift.record?.clock_in) {
        return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NOT_ABSENT);
      }

      const absenceResult =
        await this.attendance_repository.justifyAbsence(justification);

      if (absenceResult.IsFailure) {
        this.logger.error(absenceResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      return this.shift(id);
    }

    if (!incident) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NO_INCIDENT);
    }

    const justifyResult = await this.attendance_repository.justifyIncident(
      incident.id,
      justification,
    );

    if (justifyResult.IsFailure) {
      this.logger.error(justifyResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!justifyResult.Value) {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.ALREADY_JUSTIFIED,
      );
    }

    return this.shift(id);
  }

  //Functions
  private async shift(
    id: string,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const shiftResult = await this.shift_repository.findById(id);

    if (shiftResult.IsFailure) {
      this.logger.error(shiftResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!shiftResult.Value) {
      return ServiceResultMapper.NotFound(
        API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(shiftResult.Value);
  }
}
