//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TMyTipOutput } from '../../../types/entities';
import type { TManualAllocation } from '../../../types/repositories';

export interface IAllocationRepository {
  setManual(
    id: string,
    workAreaId: string,
    allocations: TManualAllocation[],
  ): Promise<ResultPattern<boolean>>;

  findMine(
    assignmentId: string,
    from: string,
    to: string,
  ): Promise<ResultPattern<TMyTipOutput[]>>;
}
