import { join } from 'path';
import { type ClientProviderOptions, Transport } from '@nestjs/microservices';

//Infrastructure
import { Env } from '@infrastructure/config';
import { CLOUD_GRPC_CLIENT, CLOUD_GRPC_PACKAGES } from './cloud.constant';

export const CLOUD_GRPC_CONFIG: ClientProviderOptions = {
  name: CLOUD_GRPC_CLIENT,
  transport: Transport.GRPC,
  options: {
    package: [...CLOUD_GRPC_PACKAGES],
    url: Env.CLOUD_GRPC_URL,
    maxSendMessageLength: 6 * 1024 * 1024,
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
