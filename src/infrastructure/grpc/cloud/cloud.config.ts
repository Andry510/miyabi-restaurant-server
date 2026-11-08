import { join } from 'path';
import { type ClientProviderOptions, Transport } from '@nestjs/microservices';

//Infrastructure
import { Env } from '@infrastructure/config';
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_PACKAGES,
  CLOUD_GRPC_RECONNECT_MS,
} from './cloud.constant';

export const CLOUD_GRPC_CONFIG: ClientProviderOptions = {
  name: CLOUD_GRPC_CLIENT,
  transport: Transport.GRPC,
  options: {
    package: [...CLOUD_GRPC_PACKAGES],
    url: Env.CLOUD_GRPC_URL,
    maxSendMessageLength: 6 * 1024 * 1024,
    channelOptions: {
      'grpc.initial_reconnect_backoff_ms': CLOUD_GRPC_RECONNECT_MS.INITIAL,
      'grpc.max_reconnect_backoff_ms': CLOUD_GRPC_RECONNECT_MS.MAX,
    },
    protoPath: CLOUD_GRPC_PACKAGES.map((name) =>
      join(
        __dirname,
        `proto/v1/${name.replace(/\.v1$/, '').replace(/_/g, '-')}.proto`,
      ),
    ),
    loader: {
      keepCase: true,
      defaults: true,
      arrays: true,
    },
  },
};
