//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TTransferOutput } from '../../../types/entities';

export interface IConfirmationService {
  confirm(
    transferId: string,
    accessToken: string | null,
    action: () => Promise<ResultPattern<TTransferOutput, ServiceError>>,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;
}
