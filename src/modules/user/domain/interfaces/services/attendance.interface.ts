//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TAttendanceQuerySchema } from '../../schemas';
import type { TAttendanceOutput } from '../../types/entities';

export interface IAttendanceService {
  attendance(
    userId: string,
    input: TAttendanceQuerySchema,
  ): Promise<ResultPattern<TAttendanceOutput, ServiceError>>;
}
