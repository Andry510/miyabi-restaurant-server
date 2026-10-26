//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
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

export interface ICloudTransferRepository {
  register(
    input: TRegisterBodySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  transfers(
    input: TTransfersQuerySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TPaginationService<TTransfersOutput>, ServiceError>>;

  transfer(
    input: TTransferParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  receive(
    input: TReceiveTransferSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;

  cancel(
    input: TTransferParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>>;
}
