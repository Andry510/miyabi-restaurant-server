import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { IShiftRepository } from '../../../domain/interfaces/repositories';
import type { IShiftService } from '../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TShiftsQuerySchema,
  TUpdateBodySchema,
} from '../../../domain/schemas';
import type { TShiftOutput } from '../../../domain/types/entities';
import type { TShiftRange } from '../../../domain/types/repositories';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';
import type { IWorkScheduleService } from '../../../../work-schedule/domain/interfaces/services';
import type { TWorkScheduleOutput } from '../../../../work-schedule/domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  SHIFT_LOGGER_NAME,
  SHIFT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';
import { WORK_SCHEDULE_PROVIDER_TOKENS } from '../../../../work-schedule/infrastructure/constants';

@Injectable()
export class ShiftService implements IShiftService {
  private readonly logger = new Logger(SHIFT_LOGGER_NAME.SERVICE.SHIFT);

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(WORK_SCHEDULE_PROVIDER_TOKENS.SERVICES.WORK_SCHEDULE)
    private readonly work_schedule_service: IWorkScheduleService,
    @Inject(SHIFT_PROVIDER_TOKENS.REPOSITORIES.SHIFT)
    private readonly shift_repository: IShiftRepository,
  ) {}

  //<--------- Validations --------->

  private async validateSchedule(
    id: string,
  ): Promise<ResultPattern<TWorkScheduleOutput, ServiceError>> {
    const scheduleResult = await this.work_schedule_service.workSchedule(id);

    if (scheduleResult.IsFailure) {
      return ResultPattern.Failure(scheduleResult.Error);
    }

    if (!scheduleResult.Value.status) {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.WORK_SCHEDULE_INACTIVE,
      );
    }

    return scheduleResult;
  }

  private async validateNoOverlap(
    assignmentId: string,
    ranges: TShiftRange[],
    exceptShiftId: string | null,
  ): Promise<ResultPattern<null, ServiceError>> {
    const overlapResult = await this.shift_repository.hasOverlap(
      assignmentId,
      ranges,
      exceptShiftId,
    );

    if (overlapResult.IsFailure) {
      this.logger.error(overlapResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (overlapResult.Value) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.OVERLAP);
    }

    return ServiceResultMapper.Ok(null);
  }

  private async findOutput(
    id: string,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const findResult = await this.shift_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(
        API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
      );
    }

    return ServiceResultMapper.Ok(findResult.Value);
  }

  //<--------- Service --------->

  async shifts(
    input: TShiftsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TShiftOutput>, ServiceError>> {
    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const { timezone } = settingsResult.Value;

    const listResult = await this.shift_repository.findMany(input, {
      start: TimeZone.startOfDay(input.from, timezone),
      end: TimeZone.startOfNextDay(input.to, timezone),
    });

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  shift(id: string): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    return this.findOutput(id);
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TShiftOutput[], ServiceError>> {
    const [employeeResult, scheduleResult, settingsResult] = await Promise.all([
      this.shift_repository.findEmployee(input.user_id),
      this.validateSchedule(input.work_schedule_id),
      this.setting_service.settings(),
    ]);

    if (employeeResult.IsFailure) {
      this.logger.error(employeeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const employee = employeeResult.Value;

    if (employee.kind === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_SHIFT_MESSAGE.ERROR.USER_NOT_FOUND,
      );
    }

    if (employee.kind === 'inactive') {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.USER_INACTIVE,
      );
    }

    if (employee.kind === 'without_assignment') {
      return ServiceResultMapper.Conflict(
        API_SHIFT_MESSAGE.ERROR.USER_WITHOUT_ASSIGNMENT,
      );
    }

    if (scheduleResult.IsFailure) {
      return ResultPattern.Failure(scheduleResult.Error);
    }

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const schedule = scheduleResult.Value;
    const { timezone } = settingsResult.Value;

    const ranges = input.dates.map((day) =>
      this.rangeOf(day, schedule, timezone),
    );

    const overlapResult = await this.validateNoOverlap(
      employee.assignment_id,
      ranges,
      null,
    );

    if (overlapResult.IsFailure) {
      return ResultPattern.Failure(overlapResult.Error);
    }

    const createResult = await this.shift_repository.createMany({
      assignment_id: employee.assignment_id,
      user: employee.user,
      work_schedule: { id: schedule.id, name: schedule.name },
      ranges,
      note: input.note ?? null,
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
  ): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const [currentResult, settingsResult] = await Promise.all([
      this.shift_repository.findEditable(id),
      this.setting_service.settings(),
    ]);

    if (currentResult.IsFailure) {
      this.logger.error(currentResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const current = currentResult.Value;

    if (!current) {
      return ServiceResultMapper.NotFound(
        API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
      );
    }

    if (!current.editable) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NOT_EDITABLE);
    }

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const { timezone } = settingsResult.Value;

    const scheduleResult = await this.validateSchedule(
      input.work_schedule_id ?? current.work_schedule_id,
    );

    if (scheduleResult.IsFailure) {
      return ResultPattern.Failure(scheduleResult.Error);
    }

    const schedule = scheduleResult.Value;
    const day = input.date ?? TimeZone.dayOf(current.scheduled_start, timezone);
    const range = this.rangeOf(day, schedule, timezone);

    const overlapResult = await this.validateNoOverlap(
      current.assignment_id,
      [range],
      id,
    );

    if (overlapResult.IsFailure) {
      return ResultPattern.Failure(overlapResult.Error);
    }

    const updateResult = await this.shift_repository.reschedule(id, {
      work_schedule_id: schedule.id,
      range,
      note: input.note,
    });

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!updateResult.Value) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NOT_EDITABLE);
    }

    return this.findOutput(id);
  }

  async cancel(id: string): Promise<ResultPattern<TShiftOutput, ServiceError>> {
    const cancelResult = await this.shift_repository.cancel(id);

    if (cancelResult.IsFailure) {
      this.logger.error(cancelResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const outputResult = await this.findOutput(id);

    if (outputResult.IsFailure) {
      return ResultPattern.Failure(outputResult.Error);
    }

    if (!cancelResult.Value) {
      return ServiceResultMapper.Conflict(API_SHIFT_MESSAGE.ERROR.NOT_EDITABLE);
    }

    return outputResult;
  }

  //Functions
  private rangeOf(
    day: string,
    schedule: TWorkScheduleOutput,
    timezone: string,
  ): TShiftRange {
    return TimeZone.range(
      day,
      schedule.start_time,
      schedule.end_time,
      timezone,
    );
  }
}
