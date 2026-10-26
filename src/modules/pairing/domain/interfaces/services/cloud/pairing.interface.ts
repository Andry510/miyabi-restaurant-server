//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TRegisterSchema } from '../../../schemas';
import type { TRegisterOutput } from '../../../types/entities';

export interface IPairingService {
  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TRegisterOutput, ServiceError>>;
}
