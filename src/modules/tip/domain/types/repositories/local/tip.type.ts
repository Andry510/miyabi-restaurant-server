//Domain
import type {
  TIP_PERIOD,
  TIP_POOL_STATUS,
  TIP_SANCTION_DESTINATION,
  TIP_SPLIT_METHOD,
} from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';
import type { TTipUserOutput } from '../../entities';

export type TTipRuleConfig = {
  work_area: TReference;
  percentage_bp: number | null;
  method: TIP_SPLIT_METHOD | null;
  positions: Array<{ job_position: TReference; weight_bp: number }>;
};

export type TTipRule = {
  work_area: TReference;
  percentage_bp: number;
  method: TIP_SPLIT_METHOD;
};

export type TTipShift = {
  shift_id: string;
  assignment_id: string;
  work_area_id: string;
  weight_bp: number;
  user: TTipUserOutput;
  completed: boolean;
  absent: boolean;
  late: boolean;
  left_early: boolean;
};

export type TTipPolicy = {
  late_arrival_shifts_bp: number;
  absence_shifts_bp: number;
  destination: TIP_SANCTION_DESTINATION;
};

export type TTipSanction = {
  id: string;
  assignment_id: string;
  user: TTipUserOutput;
  sanction_type: TReference;
  shifts_bp: number;
  removes_all: boolean;
  note: string | null;
  created_by: string;
  created_at: Date;
};

export type TTipContext = {
  manual: Map<string, Map<string, number>>;
  disabled: Set<string>;
  sanctions: TTipSanction[];
};

export type TTipAllocationCalculation = {
  assignment_id: string;
  user: TTipUserOutput;
  shifts_bp: number;
  sanction_shifts_bp: number;
  weight_bp: number;
  amount_cents: number;
  sanction_cents: number;
};

export type TTipAreaCalculation = {
  work_area: TReference;
  percentage_bp: number;
  method: TIP_SPLIT_METHOD;
  enabled: boolean;
  amount_cents: number;
  allocations: TTipAllocationCalculation[];
};

export type TTipCalculation = {
  destination: TIP_SANCTION_DESTINATION;
  sanction_cents: number;
  areas: TTipAreaCalculation[];
  shift_ids: string[];
};

export type TTipWindow = {
  start: Date;
  end: Date;
  work_schedule_id: string | null;
};

export type TTipPoolHeader = {
  id: string;
  period: TIP_PERIOD;
  start_day: string;
  end_day: string;
  work_schedule: TReference | null;
  amount_cents: number;
  status: TIP_POOL_STATUS;
  sanction_destination: TIP_SANCTION_DESTINATION;
  sanction_cents: number;
  note: string | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TTipPool = {
  header: TTipPoolHeader;
  areas: TTipAreaCalculation[];
  sanctions: TTipSanction[];
};

export type TCreateTipPoolInput = {
  period: TIP_PERIOD;
  start_day: string;
  end_day: string;
  work_schedule_id: string | null;
  amount_cents: number;
  note: string | null;
};

export type TSaveTipPoolInput = {
  amount_cents?: number;
  note?: string;
  close: boolean;
};

export type TTipWriteResult =
  | { kind: 'ok'; header: TTipPoolHeader }
  | { kind: 'not_open' }
  | { kind: 'shift_taken' };

export type TManualAllocation = {
  assignment_id: string;
  amount_cents: number;
};

export type TCreateTipSanctionInput = {
  tip_pool_id: string;
  assignment_id: string;
  sanction_type_id: string;
  note: string | null;
  created_by: string;
};
