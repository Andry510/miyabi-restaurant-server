import type { Prisma } from '@generated/prisma/client';

//Domain
import type {
  TIP_PERIOD,
  TIP_POOL_STATUS,
  TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';
import type {
  TTipAreaOutput,
  TTipPoolDetailOutput,
  TTipPoolOutput,
  TTipRuleOutput,
  TTipUserOutput,
} from '../../../domain/types/entities';
import type {
  TTipAreaCalculation,
  TTipPoolHeader,
  TTipRuleConfig,
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
  note: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type TPoolAreaRow = {
  work_area: TReference;
  percentage: Prisma.Decimal;
  method: string;
  amount: Prisma.Decimal;
  allocations: Array<{
    user_assignment_id: string;
    minutes: number;
    weight: Prisma.Decimal;
    amount: Prisma.Decimal;
    user_assignment: { user: TUserRow };
  }>;
};

export class TipMapper {
  static toDay = (value: string): Date => new Date(`${value}T00:00:00Z`);

  static fromDay = (value: Date): string => value.toISOString().slice(0, 10);

  static toUser = (user: TUserRow): TTipUserOutput => ({
    id: user.id,
    first_name: user.profile?.first_name ?? '',
    last_name: user.profile?.last_name ?? '',
  });

  static toHeader = (row: TPoolHeaderRow): TTipPoolHeader => ({
    id: row.id,
    period: row.period as TIP_PERIOD,
    start_day: TipMapper.fromDay(row.start_day),
    end_day: TipMapper.fromDay(row.end_day),
    work_schedule: row.work_schedule,
    amount_cents: Money.toCents(row.amount),
    status: row.status as TIP_POOL_STATUS,
    note: row.note,
    closed_at: row.closed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  static toAreaCalculation = (row: TPoolAreaRow): TTipAreaCalculation => ({
    work_area: row.work_area,
    percentage_bp: Money.toCents(row.percentage),
    method: row.method as TIP_SPLIT_METHOD,
    amount_cents: Money.toCents(row.amount),
    allocations: row.allocations.map((allocation) => ({
      assignment_id: allocation.user_assignment_id,
      user: TipMapper.toUser(allocation.user_assignment.user),
      minutes: allocation.minutes,
      weight_bp: Money.toCents(allocation.weight),
      amount_cents: Money.toCents(allocation.amount),
    })),
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
    const { amount_cents: amountCents, ...rest } = header;

    return { ...rest, amount: Money.fromCents(amountCents) };
  };

  static toAreaOutput = (area: TTipAreaCalculation): TTipAreaOutput => ({
    work_area: area.work_area,
    percentage: Money.fromCents(area.percentage_bp),
    method: area.method,
    amount: Money.fromCents(area.amount_cents),
    allocations: area.allocations.map((allocation) => ({
      user: allocation.user,
      minutes: allocation.minutes,
      weight: Money.fromCents(allocation.weight_bp),
      amount: Money.fromCents(allocation.amount_cents),
    })),
  });

  static toDetailOutput = (
    header: TTipPoolHeader,
    areas: TTipAreaCalculation[],
  ): TTipPoolDetailOutput => ({
    ...TipMapper.toPoolOutput(header),
    areas: areas.map((area) => TipMapper.toAreaOutput(area)),
  });
}
