//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TPoolsQuerySchema } from '../../../schemas';
import type {
  TCreateTipPoolInput,
  TSaveTipPoolInput,
  TTipCalculation,
  TTipParticipant,
  TTipPool,
  TTipPoolHeader,
  TTipWindow,
  TTipWriteResult,
} from '../../../types/repositories';

export interface ITipRepository {
  hasOverlap(
    startDay: string,
    endDay: string,
    workScheduleId: string | null,
  ): Promise<ResultPattern<boolean>>;

  findParticipants(
    window: TTipWindow,
    poolId: string | null,
  ): Promise<ResultPattern<TTipParticipant[]>>;

  hasPendingShifts(
    window: TTipWindow,
    now: Date,
    graceStart: Date,
  ): Promise<ResultPattern<boolean>>;

  create(
    input: TCreateTipPoolInput,
    calculation: TTipCalculation,
  ): Promise<ResultPattern<TTipWriteResult>>;

  findMany(
    input: TPoolsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TTipPoolHeader>>>;

  findById(id: string): Promise<ResultPattern<TTipPool | null>>;

  exists(id: string): Promise<ResultPattern<boolean>>;

  save(
    id: string,
    input: TSaveTipPoolInput,
    calculation: TTipCalculation,
  ): Promise<ResultPattern<TTipWriteResult>>;

  reopen(id: string): Promise<ResultPattern<TTipPoolHeader | null>>;

  remove(id: string): Promise<ResultPattern<boolean>>;
}
