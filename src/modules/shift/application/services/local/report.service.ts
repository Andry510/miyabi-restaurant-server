import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { safeParse } from 'valibot';

//Domain
import { INCIDENT_TYPE } from '@domain/enums/shared';
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';
import type {
  TAttendanceRecordMessage,
  TServerMessageBody,
} from '../../../../channel/domain/types/services';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';
import type { IShiftRepository } from '../../../domain/interfaces/repositories';
import type { IReportService } from '../../../domain/interfaces/services';
import {
  AttendanceReportSchema,
  type TShiftsQuerySchema,
} from '../../../domain/schemas';
import type { TShiftOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  CHANNEL_PROVIDER_TOKENS,
  CHANNEL_REQUEST,
} from '../../../../channel/infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';
import {
  SHIFT_LOGGER_NAME,
  SHIFT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

const PAGE_SIZE = 100;
const MAX_RECORDS = 10_000;

@Injectable()
export class ReportService implements IReportService, OnModuleInit {
  private readonly logger = new Logger(SHIFT_LOGGER_NAME.SERVICE.REPORT);

  constructor(
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(SHIFT_PROVIDER_TOKENS.REPOSITORIES.SHIFT)
    private readonly shift_repository: IShiftRepository,
  ) {}

  onModuleInit(): void {
    this.channel_service.onRequest(CHANNEL_REQUEST.ATTENDANCE, (params) =>
      this.attendance(params),
    );
  }

  async attendance(
    params: unknown,
  ): Promise<ResultPattern<TServerMessageBody, ServiceError>> {
    const rangeResult = safeParse(AttendanceReportSchema, params);

    if (!rangeResult.success) {
      return ServiceResultMapper.BadRequest();
    }

    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const { timezone } = settingsResult.Value;
    const { from, to } = rangeResult.output;
    const range = {
      start: TimeZone.startOfDay(from, timezone),
      end: TimeZone.startOfNextDay(to, timezone),
    };

    const records: TAttendanceRecordMessage[] = [];

    for (let page = 1; records.length < MAX_RECORDS; page++) {
      const input = {
        from,
        to,
        page,
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      } as unknown as TShiftsQuerySchema;

      const pageResult = await this.shift_repository.findMany(input, range);

      if (pageResult.IsFailure) {
        this.logger.error(pageResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      const { data, count } = pageResult.Value;

      records.push(...data.map((shift) => this.toRecord(shift, timezone)));

      if (data.length < PAGE_SIZE || records.length >= count) {
        break;
      }
    }

    return ServiceResultMapper.Ok({ attendance: { records } });
  }

  //Functions
  private toRecord(
    shift: TShiftOutput,
    timezone: string,
  ): TAttendanceRecordMessage {
    const incidents = shift.attendance?.incidents ?? [];
    const minutes = (type: INCIDENT_TYPE): number | undefined =>
      incidents.find((incident) => incident.type === type)?.minutes ??
      undefined;

    return {
      user_id: shift.user.id,
      first_name: shift.user.first_name,
      last_name: shift.user.last_name,
      date: TimeZone.dayOf(shift.scheduled_start, timezone),
      scheduled_start: shift.scheduled_start.toISOString(),
      scheduled_end: shift.scheduled_end.toISOString(),
      clock_in: shift.attendance?.clock_in?.toISOString(),
      clock_out: shift.attendance?.clock_out?.toISOString(),
      status: shift.attendance_status ?? shift.status,
      late_minutes: minutes(INCIDENT_TYPE.LATE_ARRIVAL),
      early_departure_minutes: minutes(INCIDENT_TYPE.EARLY_DEPARTURE),
      incidents: incidents.map((incident) => incident.type),
    };
  }
}
