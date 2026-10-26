//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TRegisterSchema,
  TShiftsQuerySchema,
  TUpdateBodySchema,
} from '../../../schemas';
import type { TShiftOutput } from '../../../types/entities';

export interface IShiftService {
  shifts(
    input: TShiftsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TShiftOutput>, ServiceError>>;

  shift(id: string): Promise<ResultPattern<TShiftOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TShiftOutput[], ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TShiftOutput, ServiceError>>;

  cancel(id: string): Promise<ResultPattern<TShiftOutput, ServiceError>>;
}
