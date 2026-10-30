//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCopyWeekBodySchema } from '../../../schemas';
import type { TCopyWeekOutput } from '../../../types/entities';

export interface IWeekService {
  copy(
    input: TCopyWeekBodySchema,
  ): Promise<ResultPattern<TCopyWeekOutput, ServiceError>>;
}
