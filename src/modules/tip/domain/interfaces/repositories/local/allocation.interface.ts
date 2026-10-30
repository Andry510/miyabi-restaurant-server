//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TMyTipOutput } from '../../../types/entities';
import type { TManualAllocation } from '../../../types/repositories';

export interface IAllocationRepository {
  resetManual(id: string, workAreaId: string): Promise<ResultPattern<boolean>>;

  setManual(
    id: string,
    workAreaId: string,
    allocations: TManualAllocation[],
  ): Promise<ResultPattern<boolean>>;

  setEnabled(
    id: string,
    workAreaId: string,
    enabled: boolean,
  ): Promise<ResultPattern<boolean>>;

  findMine(
    assignmentId: string,
    from: string,
    to: string,
  ): Promise<ResultPattern<TMyTipOutput[]>>;
}
