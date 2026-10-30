import type { Prisma } from '@generated/prisma/client';

//Domain
import {
  ATTENDANCE_STATUS,
  INCIDENT_TYPE,
  type TIP_PERIOD,
  type TIP_POOL_STATUS,
  type TIP_SANCTION_DESTINATION,
  type TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';
import type {
  TTipAreaOutput,
  TTipPoolDetailOutput,
  TTipPoolOutput,
  TTipRuleOutput,
  TTipSanctionOutput,
  TTipSanctionTypeOutput,
  TTipUserOutput,
} from '../../../domain/types/entities';
import type {
  TTipAreaCalculation,
  TTipPoolHeader,
  TTipRuleConfig,
  TTipSanction,
  TTipShift,
} from '../../../domain/types/repositories';

//Infrastructure
import { Money } from '@infrastructure/utils';

type TUserRow = {
  id: string;
  profile: { first_name: string; last_name: string } | null;
};

type TPoolHeaderRow = {
  id: string;
  period: string;
  start_day: Date;
  end_day: Date;
  work_schedule: TReference | null;
  amount: Prisma.Decimal;
  status: string;
  sanction_destination: string;
  sanction_amount: Prisma.Decimal;
  note: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type TPoolAreaRow = {
  work_area: TReference;
  percentage: Prisma.Decimal;
  method: string;
  enabled: boolean;
  amount: Prisma.Decimal;
  allocations: Array<{
    user_assignment_id: string;
    shifts: Prisma.Decimal;
    sanction_shifts: Prisma.Decimal;
    weight: Prisma.Decimal;
    amount: Prisma.Decimal;
    sanction_amount: Prisma.Decimal;
    user_assignment: { user: TUserRow };
  }>;
};

type TSanctionRow = {
  id: string;
  user_assignment_id: string;
  shifts: Prisma.Decimal;
  removes_all: boolean;
  note: string | null;
  created_by: string;
  created_at: Date;
  tip_sanction_type: TReference;
  user_assignment: { user: TUserRow };
};

type TShiftRow = {
  id: string;
  scheduled_end: Date;
  attendance_record: {
    status: string;
    clock_in: Date | null;
    clock_out: Date | null;
    incidents: Array<{ type: string; justified_at: Date | null }>;
  } | null;
  user_assignment: {
    id: string;
    user: TUserRow;
    area_job_position: { work_area_id: string; tip_weight: Prisma.Decimal };
  };
};

type TSanctionTypeRow = {
  id: string;
  name: string;
  shifts: Prisma.Decimal;
  removes_all: boolean;
  created_at: Date;
  updated_at: Date;
};

export class TipMapper {
  static toDay = (value: string): Date => new Date(`${value}T00:00:00Z`);

  static fromDay = (value: Date): string => value.toISOString().slice(0, 10);

  static toUser = (user: TUserRow): TTipUserOutput => ({
    id: user.id,
    first_name: user.profile?.first_name ?? '',
    last_name: user.profile?.last_name ?? '',
  });

  static toShift = (row: TShiftRow, now: Date): TTipShift => {
    const record = row.attendance_record;
    const unjustified = (type: INCIDENT_TYPE): boolean =>
      (record?.incidents ?? []).some(
        (incident) => incident.type === type && incident.justified_at === null,
      );

    return {
      shift_id: row.id,
      assignment_id: row.user_assignment.id,
      work_area_id: row.user_assignment.area_job_position.work_area_id,
      weight_bp: Money.toCents(
        row.user_assignment.area_job_position.tip_weight,
      ),
      user: TipMapper.toUser(row.user_assignment.user),
      completed: Boolean(record?.clock_in && record.clock_out),
      absent:
        row.scheduled_end <= now &&
        !record?.clock_in &&
        record?.status !== ATTENDANCE_STATUS.EXCUSED,
      late: unjustified(INCIDENT_TYPE.LATE_ARRIVAL),
      left_early: unjustified(INCIDENT_TYPE.EARLY_DEPARTURE),
    };
  };

  static toHeader = (row: TPoolHeaderRow): TTipPoolHeader => ({
    id: row.id,
    period: row.period as TIP_PERIOD,
    start_day: TipMapper.fromDay(row.start_day),
    end_day: TipMapper.fromDay(row.end_day),
    work_schedule: row.work_schedule,
    amount_cents: Money.toCents(row.amount),
    status: row.status as TIP_POOL_STATUS,
    sanction_destination: row.sanction_destination as TIP_SANCTION_DESTINATION,
    sanction_cents: Money.toCents(row.sanction_amount),
    note: row.note,
    closed_at: row.closed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  static toAreaCalculation = (row: TPoolAreaRow): TTipAreaCalculation => ({
    work_area: row.work_area,
    percentage_bp: Money.toCents(row.percentage),
    method: row.method as TIP_SPLIT_METHOD,
    enabled: row.enabled,
    amount_cents: Money.toCents(row.amount),
    allocations: row.allocations.map((allocation) => ({
      assignment_id: allocation.user_assignment_id,
      user: TipMapper.toUser(allocation.user_assignment.user),
      shifts_bp: Money.toCents(allocation.shifts),
      sanction_shifts_bp: Money.toCents(allocation.sanction_shifts),
      weight_bp: Money.toCents(allocation.weight),
      amount_cents: Money.toCents(allocation.amount),
      sanction_cents: Money.toCents(allocation.sanction_amount),
    })),
  });

  static toSanction = (row: TSanctionRow): TTipSanction => ({
    id: row.id,
    assignment_id: row.user_assignment_id,
    user: TipMapper.toUser(row.user_assignment.user),
    sanction_type: row.tip_sanction_type,
    shifts_bp: Money.toCents(row.shifts),
    removes_all: row.removes_all,
    note: row.note,
    created_by: row.created_by,
    created_at: row.created_at,
  });

  static toSanctionTypeOutput = (
    row: TSanctionTypeRow,
  ): TTipSanctionTypeOutput => ({
    ...row,
    shifts: Money.fromCents(Money.toCents(row.shifts)),
  });

  static toRuleOutput = (config: TTipRuleConfig): TTipRuleOutput => ({
    work_area: config.work_area,
    percentage:
      config.percentage_bp === null
        ? null
        : Money.fromCents(config.percentage_bp),
    method: config.method,
    positions: config.positions.map((position) => ({
      job_position: position.job_position,
      weight: Money.fromCents(position.weight_bp),
    })),
  });

  static toPoolOutput = (header: TTipPoolHeader): TTipPoolOutput => {
    const {
      amount_cents: amountCents,
      sanction_cents: sanctionCents,
      ...rest
    } = header;

    return {
      ...rest,
      amount: Money.fromCents(amountCents),
      sanction_amount: Money.fromCents(sanctionCents),
    };
  };

  static toAreaOutput = (area: TTipAreaCalculation): TTipAreaOutput => ({
    work_area: area.work_area,
    percentage: Money.fromCents(area.percentage_bp),
    method: area.method,
    enabled: area.enabled,
    amount: Money.fromCents(area.amount_cents),
    allocations: area.allocations.map((allocation) => ({
      user: allocation.user,
      shifts: Money.fromCents(allocation.shifts_bp),
      sanction_shifts: Money.fromCents(allocation.sanction_shifts_bp),
      weight: Money.fromCents(allocation.weight_bp),
      amount: Money.fromCents(allocation.amount_cents),
      sanction_amount: Money.fromCents(allocation.sanction_cents),
    })),
  });

  static toSanctionOutput = (sanction: TTipSanction): TTipSanctionOutput => ({
    id: sanction.id,
    user: sanction.user,
    sanction_type: sanction.sanction_type,
    shifts: Money.fromCents(sanction.shifts_bp),
    removes_all: sanction.removes_all,
    note: sanction.note,
    created_by: sanction.created_by,
    created_at: sanction.created_at,
  });

  static toDetailOutput = (
    header: TTipPoolHeader,
    areas: TTipAreaCalculation[],
    sanctions: TTipSanction[],
  ): TTipPoolDetailOutput => ({
    ...TipMapper.toPoolOutput(header),
    areas: areas.map((area) => TipMapper.toAreaOutput(area)),
    sanctions: sanctions.map((sanction) =>
      TipMapper.toSanctionOutput(sanction),
    ),
  });
}
