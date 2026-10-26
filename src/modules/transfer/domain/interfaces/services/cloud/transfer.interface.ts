//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TReceiveTransferSchema,
  TRegisterBodySchema,
  TTransferParamSchema,
  TTransfersQuerySchema,
} from '../../../schemas';
import type {
  TTransferOutput,
  TTransfersOutput,
} from '../../../types/entities';

export interface ITransferService {
  register(
    input: TRegisterBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  transfers(
    input: TTransfersQuerySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TPaginationService<TTransfersOutput>, ServiceError>>;

  transfer(
    input: TTransferParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  receive(
    input: TReceiveTransferSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  cancel(
    input: TTransferParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;
}
