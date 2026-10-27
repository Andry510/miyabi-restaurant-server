//Domain
import type { ORDER_LINE_CHANGE } from '@domain/enums/shared';
import type {
  TOrderDispatchOutput,
  TOrderOutput,
  TOrderProductOutput,
  TOrderRequestOutput,
} from '../../entities';

export type TOrderProductRow = TOrderProductOutput & {
  cloud_id: string;
};

export type TOrderRequestRow = TOrderRequestOutput & {
  product: TOrderProductRow;
};

export type TOrderItemRow = {
  product: TOrderProductRow;
  quantity: number;
  to_location_id: string | null;
};

export type TOrderDraft = {
  header: TOrderOutput;
  requests: TOrderRequestRow[];
  items: TOrderItemRow[];
  dispatches: TOrderDispatchOutput[];
};

export type TOrderLine = {
  product: TOrderProductRow;
  requested_quantity: number;
  quantity: number;
  to_location_id: string | null;
  suggested_location_id: string | null;
  change: ORDER_LINE_CHANGE;
  requests: TOrderRequestOutput[];
};

export type TDispatchPlan = {
  idempotency_key: string;
  to_location_id: string;
  product_ids: string[];
};

export type TDispatchToSend = {
  id: string;
  idempotency_key: string;
  to_location_id: string;
  items: Array<{ cloud_product_id: string; quantity: number }>;
};

export type TDispatchResult =
  | { id: string; sent: true; transfer_id: string }
  | { id: string; sent: false; error: string };

export type TSaveRequestInput = {
  order_id: string;
  assignment_id: string;
  product_id: string;
  quantity: number;
  note: string | null;
};

export type TRequestChangeResult<T> =
  { kind: 'ok'; value: T } | { kind: 'not_found' } | { kind: 'not_open' };
