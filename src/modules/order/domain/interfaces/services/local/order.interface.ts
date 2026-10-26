//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TItemBodySchema, TOrdersQuerySchema } from '../../../schemas';
import type { TOrderDetailOutput, TOrderOutput } from '../../../types/entities';

export interface IOrderService {
  current(): Promise<ResultPattern<TOrderDetailOutput | null, ServiceError>>;

  saveItem(
    productId: string,
    input: TItemBodySchema,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>>;

  resetItem(
    productId: string,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>>;

  send(
    accessToken: string | null,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>>;

  retry(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>>;

  orders(
    input: TOrdersQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TOrderOutput>, ServiceError>>;

  order(id: string): Promise<ResultPattern<TOrderDetailOutput, ServiceError>>;
}
