//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TLinksQuerySchema } from '../../../schemas';
import type { TLinkedOutput, TLinkedUserOutput } from '../../../types/entities';
import type {
  TLinkPair,
  TLinkSide,
  TUnlinkResult,
} from '../../../types/repositories';

export interface IAreaJobPositionRepository {
  findJobPositionsByWorkArea(
    workAreaId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedOutput>>>;

  findWorkAreasByJobPosition(
    jobPositionId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedOutput>>>;

  findUsers(
    side: TLinkSide,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedUserOutput>>>;

  link(pairs: TLinkPair[]): Promise<ResultPattern<void>>;

  unlink(pairs: TLinkPair[]): Promise<ResultPattern<TUnlinkResult>>;
}
