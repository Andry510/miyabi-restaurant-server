//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TOrdersQuerySchema } from '../../../schemas';
import type { TOrderOutput } from '../../../types/entities';
import type {
  TDispatchPlan,
  TDispatchResult,
  TDispatchToSend,
  TOrderDraft,
  TOrderLine,
} from '../../../types/repositories';

export interface IOrderRepository {
  openOrderId(businessDate: string): Promise<ResultPattern<string>>;

  findOpenOrderId(): Promise<ResultPattern<string | null>>;

  findDraft(id: string): Promise<ResultPattern<TOrderDraft | null>>;

  findSuggestions(
    productIds: string[],
  ): Promise<ResultPattern<Map<string, string>>>;

  saveItem(
    orderId: string,
    productId: string,
    quantity: number,
    toLocationId: string | null,
  ): Promise<ResultPattern<boolean>>;

  resetItem(
    orderId: string,
    productId: string,
  ): Promise<ResultPattern<boolean>>;

  startSend(
    orderId: string,
    lines: TOrderLine[],
    plans: TDispatchPlan[],
    sentBy: string | null,
  ): Promise<ResultPattern<TDispatchToSend[] | null>>;

  findPendingDispatches(
    orderId: string,
  ): Promise<ResultPattern<TDispatchToSend[] | null>>;

  finishSend(
    orderId: string,
    results: TDispatchResult[],
  ): Promise<ResultPattern<null>>;

  findMany(
    input: TOrdersQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TOrderOutput>>>;
}
