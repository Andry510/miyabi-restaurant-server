//Domain
import type { DISPATCH_STATUS, ORDER_STATUS } from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';

export type TOrderProductOutput = {
  id: string;
  name: string;
  unit: string;
  storage_code: string;
};

export type TOrderUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
};

export type TOrderRequestOutput = {
  id: string;
  user: TOrderUserOutput;
  work_area: TReference;
  quantity: number;
  note: string | null;
};

export type TOrderLineOutput = {
  product: TOrderProductOutput;
  requested_quantity: number;
  quantity: number;
  to_location_id: string | null;
  suggested_location_id: string | null;
  overridden: boolean;
  requests: TOrderRequestOutput[];
};

export type TOrderDispatchOutput = {
  id: string;
  to_location_id: string;
  status: DISPATCH_STATUS;
  transfer_id: string | null;
  last_error: string | null;
  sent_at: Date | null;
};

export type TOrderOutput = {
  id: string;
  business_date: string;
  status: ORDER_STATUS;
  note: string | null;
  created_at: Date;
  updated_at: Date;
};

export type TOrderDetailOutput = TOrderOutput & {
  lines: TOrderLineOutput[];
  dispatches: TOrderDispatchOutput[];
};

export type TMyRequestOutput = {
  id: string;
  order: Pick<TOrderOutput, 'id' | 'business_date' | 'status'>;
  product: TOrderProductOutput;
  quantity: number;
  note: string | null;
  final_quantity: number | null;
};
