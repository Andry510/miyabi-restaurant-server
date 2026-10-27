//Domain
import type { DISPATCH_STATUS, ORDER_STATUS } from '@domain/enums/shared';
import type {
  TMyRequestOutput,
  TOrderDetailOutput,
  TOrderDispatchOutput,
  TOrderOutput,
  TOrderProductOutput,
  TOrderUserOutput,
} from '../../../domain/types/entities';
import type {
  TDispatchToSend,
  TOrderLine,
  TOrderProductRow,
} from '../../../domain/types/repositories';

type TUserRow = {
  id: string;
  profile: { first_name: string; last_name: string } | null;
};

type TOrderRow = {
  id: string;
  business_date: Date;
  status: string;
  sent_by: string | null;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type TDispatchRow = {
  id: string;
  to_location_id: string;
  status: string;
  transfer_id: string | null;
  last_error: string | null;
  sent_at: Date | null;
};

type TMyRequestRow = {
  id: string;
  requested_qty: number;
  note: string | null;
  product: TOrderProductRow;
  transfer_draft: { id: string; business_date: Date; status: string };
};

type TDispatchSendRow = {
  id: string;
  idempotency_key: string;
  to_location_id: string;
  items: Array<{ quantity: number; product: { cloud_id: string } }>;
};

export const DISPATCH_SELECT = {
  id: true,
  idempotency_key: true,
  to_location_id: true,
  items: {
    select: {
      quantity: true,
      product: { select: { cloud_id: true } },
    },
  },
} as const;

export const ORDER_PRODUCT_SELECT = {
  id: true,
  cloud_id: true,
  name: true,
  unit: true,
  storage_code: true,
} as const;

export class OrderMapper {
  static toDay = (value: string): Date => new Date(value + 'T00:00:00Z');

  static fromDay = (value: Date): string => value.toISOString().slice(0, 10);

  static toUser = (user: TUserRow): TOrderUserOutput => ({
    id: user.id,
    first_name: user.profile?.first_name ?? '',
    last_name: user.profile?.last_name ?? '',
  });

  static toProduct = (product: TOrderProductRow): TOrderProductOutput => ({
    id: product.id,
    name: product.name,
    unit: product.unit,
    storage_code: product.storage_code,
  });

  static toOrder = (row: TOrderRow): TOrderOutput => ({
    ...row,
    business_date: OrderMapper.fromDay(row.business_date),
    status: row.status as ORDER_STATUS,
  });

  static toDispatchToSend = (row: TDispatchSendRow): TDispatchToSend => ({
    id: row.id,
    idempotency_key: row.idempotency_key,
    to_location_id: row.to_location_id,
    items: row.items.map((item) => ({
      cloud_product_id: item.product.cloud_id,
      quantity: item.quantity,
    })),
  });

  static toDispatch = (row: TDispatchRow): TOrderDispatchOutput => ({
    ...row,
    status: row.status as DISPATCH_STATUS,
  });

  static toMyRequest = (
    row: TMyRequestRow,
    finalQuantity: number | null,
  ): TMyRequestOutput => ({
    id: row.id,
    order: {
      id: row.transfer_draft.id,
      business_date: OrderMapper.fromDay(row.transfer_draft.business_date),
      status: row.transfer_draft.status as ORDER_STATUS,
    },
    product: OrderMapper.toProduct(row.product),
    quantity: row.requested_qty,
    note: row.note,
    final_quantity: finalQuantity,
  });

  static toDetail = (
    header: TOrderOutput,
    lines: TOrderLine[],
    dispatches: TOrderDispatchOutput[],
  ): TOrderDetailOutput => ({
    ...header,
    lines: lines.map((line) => ({
      ...line,
      product: OrderMapper.toProduct(line.product),
    })),
    dispatches,
  });
}
