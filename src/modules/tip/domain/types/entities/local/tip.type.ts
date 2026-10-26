//Domain
import type {
  TIP_PERIOD,
  TIP_POOL_STATUS,
  TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';

export type TTipPositionOutput = {
  job_position: TReference;
  weight: number;
};

export type TTipRuleOutput = {
  work_area: TReference;
  percentage: number | null;
  method: TIP_SPLIT_METHOD | null;
  positions: TTipPositionOutput[];
};

export type TTipRulesOutput = {
  period: TIP_PERIOD;
  total_percentage: number;
  rules: TTipRuleOutput[];
};

export type TTipUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
};

export type TTipAllocationOutput = {
  user: TTipUserOutput;
  minutes: number;
  weight: number;
  amount: number;
};

export type TTipAreaOutput = {
  work_area: TReference;
  percentage: number;
  method: TIP_SPLIT_METHOD;
  amount: number;
  allocations: TTipAllocationOutput[];
};

export type TTipPoolOutput = {
  id: string;
  period: TIP_PERIOD;
  start_day: string;
  end_day: string;
  work_schedule: TReference | null;
  amount: number;
  status: TIP_POOL_STATUS;
  note: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TTipPoolDetailOutput = TTipPoolOutput & {
  areas: TTipAreaOutput[];
};

export type TMyTipOutput = {
  pool: Pick<
    TTipPoolOutput,
    'id' | 'period' | 'start_day' | 'end_day' | 'work_schedule'
  >;
  work_area: TReference;
  minutes: number;
  amount: number;
};

export type TMyTipsOutput = {
  from: string;
  to: string;
  total: number;
  tips: TMyTipOutput[];
};
