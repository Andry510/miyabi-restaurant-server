import { type CallOptions, Metadata } from '@grpc/grpc-js';
import { firstValueFrom, type Observable } from 'rxjs';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens } from '@domain/types/shared';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { GRPC_METADATA_KEY, LOGGER_GLOBAL } from '@infrastructure/constants';
import { CloudErrorMapper } from './cloud-error.mapper';
import { CLOUD_GRPC_DEADLINE_MS } from './cloud.constant';

const logger = new Logger(LOGGER_GLOBAL.GRPC.CLOUD);

const SERVER_REJECTED_CODES: readonly string[] = Object.freeze([
  'ERROR_INVALID_SERVER_TOKEN',
]);

type TServerRejectedHandler = (code: string) => void;

export class CloudRequest {
  private static serverToken: string | null = null;
  private static rejectedHandler: TServerRejectedHandler | null = null;

  static useServerToken = (serverToken: string | null): void => {
    CloudRequest.serverToken = serverToken;
  };

  static onServerRejected = (handler: TServerRejectedHandler): void => {
    CloudRequest.rejectedHandler = handler;
  };

  static metadata = (
    { authorization }: TCloudTokens = {},
    serverToken: string | null = CloudRequest.serverToken,
  ): Metadata => {
    const metadata = new Metadata();

    if (serverToken) {
      metadata.set(GRPC_METADATA_KEY.SERVER_TOKEN, serverToken);
    }

    if (authorization) {
      metadata.set(GRPC_METADATA_KEY.DEFAULT, `Bearer ${authorization}`);
    }

    return metadata;
  };

  static options = (): CallOptions => ({
    deadline: Date.now() + CLOUD_GRPC_DEADLINE_MS,
  });

  static send = async <T>(
    call: Observable<T>,
    requiresServer: boolean = true,
  ): Promise<ResultPattern<T, ServiceError>> => {
    if (requiresServer && !CloudRequest.serverToken) {
      return ResultPattern.Failure(
        new ServiceError(
          'UNAVAILABLE',
          API_MESSAGE_GLOBAL.ERROR.SERVER_UNLINKED,
        ),
      );
    }

    try {
      const response = await firstValueFrom(call);

      return ResultPattern.Success(response);
    } catch (error) {
      const serviceError = CloudErrorMapper.toServiceError(error);

      if (
        serviceError.code === 'UNAVAILABLE' ||
        serviceError.code === 'INTERNAL'
      ) {
        logger.error(error);
      }

      if (
        requiresServer &&
        SERVER_REJECTED_CODES.includes(serviceError.message_code)
      ) {
        CloudRequest.rejectedHandler?.(serviceError.message_code);
      }

      return ResultPattern.Failure(serviceError);
    }
  };
}
