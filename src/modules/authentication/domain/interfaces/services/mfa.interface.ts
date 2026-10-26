//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TMfaCodeOutput } from '../../types/entities';
import type { TMfaCodeInput } from '../../types/services';

export interface IMfaService {
  qr(mfaToken: string): Promise<ResultPattern<string, ServiceError>>;

  code(
    input: TMfaCodeInput,
    mfaToken: string,
  ): Promise<ResultPattern<TMfaCodeOutput, ServiceError>>;
}
