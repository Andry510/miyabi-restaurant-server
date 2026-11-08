//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TRegisterSchema, TReplaceTokenSchema } from '../../../schemas';
import type {
  TPairingStatusOutput,
  TRegisterOutput,
} from '../../../types/entities';

export interface IPairingService {
  register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TRegisterOutput, ServiceError>>;

  replaceToken(
    input: TReplaceTokenSchema,
  ): Promise<ResultPattern<TPairingStatusOutput, ServiceError>>;

  status(): ResultPattern<TPairingStatusOutput, ServiceError>;
}
