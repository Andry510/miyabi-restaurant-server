//Domain
import type {
  TIP_PERIOD,
  TIP_POOL_STATUS,
  TIP_SANCTION_DESTINATION,
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
  shifts: number;
  sanction_shifts: number;
  weight: number;
  amount: number;
  sanction_amount: number;
};

export type TTipAreaOutput = {
  work_area: TReference;
  percentage: number;
  method: TIP_SPLIT_METHOD;
  enabled: boolean;
  amount: number;
  allocations: TTipAllocationOutput[];
};

export type TTipSanctionTypeOutput = {
  id: string;
  name: string;
  shifts: number;
  removes_all: boolean;
  created_at: Date;
  updated_at: Date;
};

export type TTipSanctionOutput = {
  id: string;
  user: TTipUserOutput;
  sanction_type: TReference;
  shifts: number;
  removes_all: boolean;
  note: string | null;
  created_by: string;
  created_at: Date;
};

export type TTipPoolOutput = {
  id: string;
  period: TIP_PERIOD;
  start_day: string;
  end_day: string;
  work_schedule: TReference | null;
  amount: number;
  status: TIP_POOL_STATUS;
  sanction_destination: TIP_SANCTION_DESTINATION;
  sanction_amount: number;
  note: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TTipPoolDetailOutput = TTipPoolOutput & {
  areas: TTipAreaOutput[];
  sanctions: TTipSanctionOutput[];
};

export type TMyTipOutput = {
  pool: Pick<
    TTipPoolOutput,
    'id' | 'period' | 'start_day' | 'end_day' | 'work_schedule'
  >;
  work_area: TReference;
  shifts: number;
  sanction_shifts: number;
  amount: number;
  sanction_amount: number;
};

export type TMyTipsOutput = {
  from: string;
  to: string;
  total: number;
  tips: TMyTipOutput[];
};
