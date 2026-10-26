//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TCheckCandidate,
  TCheckInInput,
  TCheckOutInput,
} from '../../../types/repositories';

export interface ICheckRepository {
  findCandidates(
    assignmentId: string,
    since: Date,
  ): Promise<ResultPattern<TCheckCandidate[]>>;

  checkIn(input: TCheckInInput): Promise<ResultPattern<boolean>>;

  checkOut(input: TCheckOutInput): Promise<ResultPattern<boolean>>;
}
