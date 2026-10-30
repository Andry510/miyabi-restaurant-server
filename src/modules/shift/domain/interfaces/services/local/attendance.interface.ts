//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type {
  TCorrectAttendanceBodySchema,
  TJustifyBodySchema,
} from '../../../schemas';
import type { TShiftOutput } from '../../../types/entities';

export interface IAttendanceService {
  correct(
    id: string,
    input: TCorrectAttendanceBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>>;

  justify(
    id: string,
    input: TJustifyBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>>;
}
