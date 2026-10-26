import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import {
  TIP_PERIOD,
  TIP_POOL_STATUS,
  TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import { TipAggregate } from '../../../domain/aggregates';
import type {
  IRuleRepository,
  ITipRepository,
} from '../../../domain/interfaces/repositories';
import type { ITipService } from '../../../domain/interfaces/services';
import type {
  TPoolsQuerySchema,
  TRegisterSchema,
  TUpdateBodySchema,
} from '../../../domain/schemas';
import type {
  TTipPoolDetailOutput,
  TTipPoolOutput,
} from '../../../domain/types/entities';
import type {
  TTipAreaCalculation,
  TTipCalculation,
  TTipPool,
  TTipRule,
  TTipWindow,
  TTipWriteResult,
} from '../../../domain/types/repositories';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';
import type { IWorkScheduleService } from '../../../../work-schedule/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { CHECK_OUT_GRACE_MINUTES } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Duration, Money, TimeZone } from '@infrastructure/utils';
import {
  TIP_LOGGER_NAME,
  TIP_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { TipMapper } from '../../../infrastructure/mappers';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';
import { WORK_SCHEDULE_PROVIDER_TOKENS } from '../../../../work-schedule/infrastructure/constants';

const WEEK_EXTRA_DAYS = 6;

@Injectable()
export class TipService implements ITipService {
  private readonly logger = new Logger(TIP_LOGGER_NAME.SERVICE.TIP);

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(WORK_SCHEDULE_PROVIDER_TOKENS.SERVICES.WORK_SCHEDULE)
    private readonly work_schedule_service: IWorkScheduleService,
    @Inject(TIP_PROVIDER_TOKENS.REPOSITORIES.RULE)
    private readonly rule_repository: IRuleRepository,
    @Inject(TIP_PROVIDER_TOKENS.REPOSITORIES.TIP)
    private readonly tip_repository: ITipRepository,
  ) {}

  //<--------- Validations --------->

  private async notFoundOr(
    id: string,
    conflict: string,
  ): Promise<ResultPattern<never, ServiceError>> {
    const existsResult = await this.tip_repository.exists(id);

    if (existsResult.IsFailure) {
      this.logger.error(existsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return existsResult.Value
      ? ServiceResultMapper.Conflict(conflict)
      : ServiceResultMapper.NotFound(API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND);
  }

  private async calculate(
    window: (timezone: string) => TTipWindow,
    poolId: string | null,
    amountCents: number,
    manual: Map<string, Map<string, number>>,
  ): Promise<
    ResultPattern<
      { window: TTipWindow; calculation: TTipCalculation },
      ServiceError
    >
  > {
    const [settingsResult, rulesResult] = await Promise.all([
      this.setting_service.settings(),
      this.rule_repository.findRules(),
    ]);

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    if (rulesResult.IsFailure) {
      this.logger.error(rulesResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const rules = rulesResult.Value.flatMap((config): TTipRule[] =>
      config.percentage_bp === null || config.method === null
        ? []
        : [
            {
              work_area: config.work_area,
              percentage_bp: config.percentage_bp,
              method: config.method,
            },
          ],
    );

    if (
      rules.reduce((total, rule) => total + rule.percentage_bp, 0) !== 10_000
    ) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
      );
    }

    const resolved = window(settingsResult.Value.timezone);

    const participantsResult = await this.tip_repository.findParticipants(
      resolved,
      poolId,
    );

    if (participantsResult.IsFailure) {
      this.logger.error(participantsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({
      window: resolved,
      calculation: TipAggregate.register(
        amountCents,
        rules,
        participantsResult.Value,
        manual,
      ).Calculation,
    });
  }

  private written(
    writeResult: ResultPattern<TTipWriteResult>,
    areas: TTipAreaCalculation[],
  ): ResultPattern<TTipPoolDetailOutput, ServiceError> {
    if (writeResult.IsFailure) {
      this.logger.error(writeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const result = writeResult.Value;

    if (result.kind === 'not_open') {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    if (result.kind === 'shift_taken') {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.SHIFT_TAKEN);
    }

    return ServiceResultMapper.Ok(
      TipMapper.toDetailOutput(result.header, areas),
    );
  }

  //<--------- Service --------->

  async openPool(id: string): Promise<ResultPattern<TTipPool, ServiceError>> {
    const findResult = await this.tip_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND);
    }

    if (findResult.Value.header.status !== TIP_POOL_STATUS.OPEN) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    return ServiceResultMapper.Ok(findResult.Value);
  }

  async pools(
    input: TPoolsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TTipPoolOutput>, ServiceError>> {
    const listResult = await this.tip_repository.findMany(input);

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(
      data.map((header) => TipMapper.toPoolOutput(header)),
      input.page,
      input.limit,
      count,
    );
  }

  async pool(
    id: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const findResult = await this.tip_repository.findById(id);

    if (findResult.IsFailure) {
      this.logger.error(findResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!findResult.Value) {
      return ServiceResultMapper.NotFound(API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND);
    }

    const { header, areas } = findResult.Value;

    return ServiceResultMapper.Ok(TipMapper.toDetailOutput(header, areas));
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const period = settingsResult.Value.tip_period;
    const byShift = period === TIP_PERIOD.SHIFT;

    if (byShift !== Boolean(input.work_schedule_id)) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.PERIOD_MISMATCH,
      );
    }

    const workScheduleId = input.work_schedule_id ?? null;
    const startDay = input.date;
    const endDay =
      period === TIP_PERIOD.WEEK
        ? TimeZone.addDays(startDay, WEEK_EXTRA_DAYS)
        : startDay;

    const [scheduleResult, overlapResult] = await Promise.all([
      workScheduleId
        ? this.work_schedule_service.workSchedule(workScheduleId)
        : Promise.resolve(ResultPattern.Success<null, ServiceError>(null)),
      this.tip_repository.hasOverlap(startDay, endDay, workScheduleId),
    ]);

    if (scheduleResult.IsFailure) {
      return ResultPattern.Failure(scheduleResult.Error);
    }

    if (overlapResult.IsFailure) {
      this.logger.error(overlapResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (overlapResult.Value) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.OVERLAP);
    }

    const amountCents = Money.toCents(input.amount);

    const calculateResult = await this.calculate(
      (timezone) => this.windowOf(startDay, endDay, workScheduleId, timezone),
      null,
      amountCents,
      new Map(),
    );

    if (calculateResult.IsFailure) {
      return ResultPattern.Failure(calculateResult.Error);
    }

    const { calculation } = calculateResult.Value;

    const createResult = await this.tip_repository.create(
      {
        period,
        start_day: startDay,
        end_day: endDay,
        work_schedule_id: workScheduleId,
        amount_cents: amountCents,
        note: input.note ?? null,
      },
      calculation,
    );

    return this.written(createResult, calculation.areas);
  }

  async update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    return this.recalculate(id, {
      amount_cents:
        input.amount === undefined ? undefined : Money.toCents(input.amount),
      note: input.note,
      close: false,
    });
  }

  close(
    id: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    return this.recalculate(id, { close: true });
  }

  async reopen(
    id: string,
  ): Promise<ResultPattern<TTipPoolOutput, ServiceError>> {
    const reopenResult = await this.tip_repository.reopen(id);

    if (reopenResult.IsFailure) {
      this.logger.error(reopenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!reopenResult.Value) {
      return this.notFoundOr(id, API_TIP_MESSAGE.ERROR.POOL_NOT_CLOSED);
    }

    return ServiceResultMapper.Ok(TipMapper.toPoolOutput(reopenResult.Value));
  }

  async remove(id: string): Promise<ResultPattern<null, ServiceError>> {
    const removeResult = await this.tip_repository.remove(id);

    if (removeResult.IsFailure) {
      this.logger.error(removeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!removeResult.Value) {
      return this.notFoundOr(id, API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    return ServiceResultMapper.Ok(null);
  }

  //Functions
  private async recalculate(
    id: string,
    input: { amount_cents?: number; note?: string; close: boolean },
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const poolResult = await this.openPool(id);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    const { header, areas } = poolResult.Value;

    const manual = new Map(
      areas
        .filter((area) => area.method === TIP_SPLIT_METHOD.MANUAL)
        .map((area) => [
          area.work_area.id,
          new Map(
            area.allocations.map((allocation) => [
              allocation.assignment_id,
              allocation.amount_cents,
            ]),
          ),
        ]),
    );

    const calculateResult = await this.calculate(
      (timezone) =>
        this.windowOf(
          header.start_day,
          header.end_day,
          header.work_schedule?.id ?? null,
          timezone,
        ),
      id,
      input.amount_cents ?? header.amount_cents,
      manual,
    );

    if (calculateResult.IsFailure) {
      return ResultPattern.Failure(calculateResult.Error);
    }

    const { window, calculation } = calculateResult.Value;

    if (input.close) {
      const closeResult = await this.validateClose(window, calculation);

      if (closeResult.IsFailure) {
        return ResultPattern.Failure(closeResult.Error);
      }
    }

    const saveResult = await this.tip_repository.save(id, input, calculation);

    return this.written(saveResult, calculation.areas);
  }

  private async validateClose(
    window: TTipWindow,
    calculation: TTipCalculation,
  ): Promise<ResultPattern<null, ServiceError>> {
    if (calculation.areas.length === 0) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.NO_PARTICIPANTS,
      );
    }

    const mismatch = calculation.areas.some(
      (area) =>
        area.method === TIP_SPLIT_METHOD.MANUAL &&
        area.allocations.reduce(
          (total, item) => total + item.amount_cents,
          0,
        ) !== area.amount_cents,
    );

    if (mismatch) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.MANUAL_MISMATCH,
      );
    }

    const now = new Date();

    const pendingResult = await this.tip_repository.hasPendingShifts(
      window,
      now,
      new Date(now.getTime() - CHECK_OUT_GRACE_MINUTES * Duration.MINUTE_MS),
    );

    if (pendingResult.IsFailure) {
      this.logger.error(pendingResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (pendingResult.Value) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.PENDING_SHIFTS);
    }

    return ServiceResultMapper.Ok(null);
  }

  private windowOf(
    startDay: string,
    endDay: string,
    workScheduleId: string | null,
    timezone: string,
  ): TTipWindow {
    return {
      start: TimeZone.startOfDay(startDay, timezone),
      end: TimeZone.startOfNextDay(endDay, timezone),
      work_schedule_id: workScheduleId,
    };
  }
}
