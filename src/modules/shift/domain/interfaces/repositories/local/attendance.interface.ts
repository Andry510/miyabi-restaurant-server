//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TCorrectAttendanceInput,
  TJustifyInput,
  TShiftAttendance,
} from '../../../types/repositories';

export interface IAttendanceRepository {
  findAttendance(id: string): Promise<ResultPattern<TShiftAttendance | null>>;

  correct(input: TCorrectAttendanceInput): Promise<ResultPattern<void>>;

  justifyAbsence(input: TJustifyInput): Promise<ResultPattern<void>>;

  justifyIncident(
    incidentId: string,
    input: TJustifyInput,
  ): Promise<ResultPattern<boolean>>;
}
