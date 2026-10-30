import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { WEEK_DAY } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { IWeekRepository } from '../../../domain/interfaces/repositories';
import type { IWeekService } from '../../../domain/interfaces/services';
import type { TCopyWeekBodySchema } from '../../../domain/schemas';
import type {
  TCopySkipReason,
  TCopyWeekOutput,
} from '../../../domain/types/entities';
import type {
  TShiftRange,
  TWeekCopy,
  TWeekSourceShift,
} from '../../../domain/types/repositories';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  SHIFT_LOGGER_NAME,
  SHIFT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

const WEEK_DAYS = [
  WEEK_DAY.SUNDAY,
  WEEK_DAY.MONDAY,
  WEEK_DAY.TUESDAY,
  WEEK_DAY.WEDNESDAY,
  WEEK_DAY.THURSDAY,
  WEEK_DAY.FRIDAY,
  WEEK_DAY.SATURDAY,
];

@Injectable()
export class WeekService implements IWeekService {
  private readonly logger = new Logger(SHIFT_LOGGER_NAME.SERVICE.WEEK);

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(SHIFT_PROVIDER_TOKENS.REPOSITORIES.WEEK)
    private readonly week_repository: IWeekRepository,
  ) {}

  async copy(
    input: TCopyWeekBodySchema,
  ): Promise<ResultPattern<TCopyWeekOutput, ServiceError>> {
    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const { timezone, week_start_day: weekStart } = settingsResult.Value;
    const startsWeek = (day: string): boolean =>
      WEEK_DAYS[TimeZone.weekDayOf(day)] === weekStart;

    if (!startsWeek(input.from_week) || !startsWeek(input.to_week)) {
      return ServiceResultMapper.BadRequest(API_SHIFT_MESSAGE.ERROR.WEEK_START);
    }

    if (input.from_week === input.to_week) {
      return ServiceResultMapper.BadRequest(API_SHIFT_MESSAGE.ERROR.SAME_WEEK);
    }

    const sourceResult = await this.week_repository.findSource(
      {
        start: TimeZone.startOfDay(input.from_week, timezone),
        end: TimeZone.startOfDay(
          TimeZone.addDays(input.from_week, 7),
          timezone,
        ),
      },
      input.user_ids,
    );

    if (sourceResult.IsFailure) {
      this.logger.error(sourceResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const offset = TimeZone.daysBetween(input.from_week, input.to_week);
    const targetStart = TimeZone.startOfDay(input.to_week, timezone);
    const targetEnd = TimeZone.startOfDay(
      TimeZone.addDays(input.to_week, 8),
      timezone,
    );

    const busyResult = await this.week_repository.findBusy(
      [...new Set(sourceResult.Value.map((shift) => shift.assignment_id))],
      { start: targetStart, end: targetEnd },
    );

    if (busyResult.IsFailure) {
      this.logger.error(busyResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const busy = busyResult.Value;
    const now = new Date();
    const copies: TWeekCopy[] = [];
    const skipped: TCopyWeekOutput['skipped'] = [];

    for (const shift of sourceResult.Value) {
      const date = TimeZone.addDays(
        TimeZone.dayOf(shift.scheduled_start, timezone),
        offset,
      );
      const range = TimeZone.range(
        date,
        shift.work_schedule.start_time,
        shift.work_schedule.end_time,
        timezone,
      );
      const reason = this.skipReason(shift, range, now, busy);

      if (reason) {
        skipped.push({ shift_id: shift.id, user: shift.user, date, reason });
        continue;
      }

      busy.push({ assignment_id: shift.assignment_id, ...range });
      copies.push({
        assignment_id: shift.assignment_id,
        user: shift.user,
        work_schedule: {
          id: shift.work_schedule.id,
          name: shift.work_schedule.name,
        },
        ...range,
        note: shift.note,
      });
    }

    const createResult =
      copies.length > 0
        ? await this.week_repository.createCopies(copies)
        : ResultPattern.Success([]);

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({ created: createResult.Value, skipped });
  }

  //Functions
  private skipReason(
    shift: TWeekSourceShift,
    range: TShiftRange,
    now: Date,
    busy: Array<TShiftRange & { assignment_id: string }>,
  ): TCopySkipReason | null {
    if (!shift.active_employee) {
      return 'employee_inactive';
    }

    if (!shift.work_schedule.active) {
      return 'schedule_inactive';
    }

    if (range.start <= now) {
      return 'past';
    }

    const overlaps = busy.some(
      (item) =>
        item.assignment_id === shift.assignment_id &&
        item.start < range.end &&
        item.end > range.start,
    );

    return overlaps ? 'overlap' : null;
  }
}
