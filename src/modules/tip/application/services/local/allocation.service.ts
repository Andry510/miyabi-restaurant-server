import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { TIP_SPLIT_METHOD } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { IAllocationRepository } from '../../../domain/interfaces/repositories';
import type {
  IAllocationService,
  ITipService,
} from '../../../domain/interfaces/services';
import type {
  TAreaBodySchema,
  TAreaStatusBodySchema,
  TMyTipsQuerySchema,
} from '../../../domain/schemas';
import type {
  TMyTipsOutput,
  TTipPoolDetailOutput,
} from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Xlsx } from '@infrastructure/exporters';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Money, TokenPayload } from '@infrastructure/utils';
import {
  TIP_LOGGER_NAME,
  TIP_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { TipMapper } from '../../../infrastructure/mappers';

@Injectable()
export class AllocationService implements IAllocationService {
  private readonly logger = new Logger(TIP_LOGGER_NAME.SERVICE.ALLOCATION);

  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.TIP)
    private readonly tip_service: ITipService,
    @Inject(TIP_PROVIDER_TOKENS.REPOSITORIES.ALLOCATION)
    private readonly allocation_repository: IAllocationRepository,
  ) {}

  async area(
    id: string,
    workAreaId: string,
    input: TAreaBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const poolResult = await this.tip_service.openPool(id);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    const { header, areas, sanctions } = poolResult.Value;
    const area = areas.find((item) => item.work_area.id === workAreaId);

    if (!area) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
      );
    }

    const byUser = new Map(
      area.allocations.map((allocation) => [allocation.user.id, allocation]),
    );

    const amounts = new Map<string, number>();

    for (const item of input.allocations) {
      const allocation = byUser.get(item.user_id);

      if (!allocation) {
        return ServiceResultMapper.Conflict(
          API_TIP_MESSAGE.ERROR.USER_NOT_IN_AREA,
        );
      }

      amounts.set(allocation.assignment_id, Money.toCents(item.amount));
    }

    const total = [...amounts.values()].reduce((sum, value) => sum + value, 0);

    if (total !== area.amount_cents) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.MANUAL_MISMATCH,
      );
    }

    const manualResult = await this.allocation_repository.setManual(
      id,
      workAreaId,
      [...amounts].map(([assignmentId, amountCents]) => ({
        assignment_id: assignmentId,
        amount_cents: amountCents,
      })),
    );

    if (manualResult.IsFailure) {
      this.logger.error(manualResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!manualResult.Value) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    const updated = areas.map((item) =>
      item === area
        ? {
            ...item,
            method: TIP_SPLIT_METHOD.MANUAL,
            allocations: item.allocations.map((allocation) => ({
              ...allocation,
              amount_cents: amounts.get(allocation.assignment_id) ?? 0,
            })),
          }
        : item,
    );

    return ServiceResultMapper.Ok(
      TipMapper.toDetailOutput(header, updated, sanctions),
    );
  }

  async resetArea(
    id: string,
    workAreaId: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const poolResult = await this.tip_service.openPool(id);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    if (
      !poolResult.Value.areas.some((area) => area.work_area.id === workAreaId)
    ) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
      );
    }

    const resetResult = await this.allocation_repository.resetManual(
      id,
      workAreaId,
    );

    if (resetResult.IsFailure) {
      this.logger.error(resetResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!resetResult.Value) {
      return ServiceResultMapper.Conflict(
        API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
      );
    }

    return this.tip_service.update(id, {});
  }

  async areaStatus(
    id: string,
    workAreaId: string,
    input: TAreaStatusBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>> {
    const poolResult = await this.tip_service.openPool(id);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    if (
      !poolResult.Value.areas.some((area) => area.work_area.id === workAreaId)
    ) {
      return ServiceResultMapper.NotFound(
        API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
      );
    }

    const statusResult = await this.allocation_repository.setEnabled(
      id,
      workAreaId,
      input.enabled,
    );

    if (statusResult.IsFailure) {
      this.logger.error(statusResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!statusResult.Value) {
      return ServiceResultMapper.Conflict(API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN);
    }

    return this.tip_service.update(id, {});
  }

  async export(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>> {
    const poolResult = await this.tip_service.pool(id);

    if (poolResult.IsFailure) {
      return ResultPattern.Failure(poolResult.Error);
    }

    const pool = poolResult.Value;
    const rows: Array<Array<string | number | null>> = [
      ['Reparto de propinas'],
      ['Del', pool.start_day, 'Al', pool.end_day],
      ['Total', pool.amount, 'Estado', pool.status],
      ['Fondo de sanciones', pool.sanction_amount],
      [],
      [
        'Área',
        'Empleado',
        'Turnos',
        'Turnos sancionados',
        'Factor',
        'Propina',
        'Sanción',
        'Firma',
      ],
      ...pool.areas.flatMap((area) =>
        area.allocations.map((allocation) => [
          area.work_area.name,
          `${allocation.user.first_name} ${allocation.user.last_name}`,
          allocation.shifts,
          allocation.sanction_shifts,
          allocation.weight,
          allocation.amount,
          allocation.sanction_amount,
          null,
        ]),
      ),
    ];

    const bufferResult = Xlsx.sheetExcel(
      TokenPayload.email(accessToken),
      'propinas',
      rows,
    );

    if (bufferResult.IsFailure) {
      this.logger.error(bufferResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(bufferResult.Value);
  }

  async mine(
    user: TUserDetail,
    input: TMyTipsQuerySchema,
  ): Promise<ResultPattern<TMyTipsOutput, ServiceError>> {
    const assignmentId = user.assignment?.id;

    const mineResult = assignmentId
      ? await this.allocation_repository.findMine(
          assignmentId,
          input.from,
          input.to,
        )
      : ResultPattern.Success([]);

    if (mineResult.IsFailure) {
      this.logger.error(mineResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const tips = mineResult.Value;

    return ServiceResultMapper.Ok({
      from: input.from,
      to: input.to,
      total: Money.fromCents(
        tips.reduce((total, tip) => total + Money.toCents(tip.amount), 0),
      ),
      tips,
    });
  }
}
