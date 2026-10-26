import { type CallOptions, Metadata } from '@grpc/grpc-js';
import { firstValueFrom, type Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens } from '@domain/types/shared';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';
import { GRPC_METADATA_KEY, LOGGER_GLOBAL } from '@infrastructure/constants';
import { CloudErrorMapper } from './cloud-error.mapper';
import { CLOUD_GRPC_DEADLINE_MS } from './cloud.constant';

const logger = new Logger(LOGGER_GLOBAL.GRPC.CLOUD);

export class CloudRequest {
  static metadata = ({ authorization }: TCloudTokens = {}): Metadata => {
    const metadata = new Metadata();

    if (Env.SERVER_TOKEN) {
      metadata.set(GRPC_METADATA_KEY.SERVER_TOKEN, Env.SERVER_TOKEN);
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
  ): Promise<ResultPattern<T, ServiceError>> => {
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

      return ResultPattern.Failure(serviceError);
    }
  };
}
