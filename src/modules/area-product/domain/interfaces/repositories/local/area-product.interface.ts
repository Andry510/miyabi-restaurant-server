//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TLinksQuerySchema } from '../../../schemas';
import type {
  TAreaProductOutput,
  TProductAreaOutput,
} from '../../../types/entities';
import type { TLinkPair, TUnlinkResult } from '../../../types/repositories';

export interface IAreaProductRepository {
  findProductsByWorkArea(
    workAreaId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TAreaProductOutput>>>;

  findWorkAreasByProduct(
    productId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TProductAreaOutput>>>;

  link(pairs: TLinkPair[]): Promise<ResultPattern<void>>;

  unlink(pairs: TLinkPair[]): Promise<ResultPattern<TUnlinkResult>>;
}
