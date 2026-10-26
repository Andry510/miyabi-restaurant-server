import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

//Infrastructure
import { CLOUD_GRPC_CONFIG } from './cloud.config';

@Global()
@Module({
  imports: [ClientsModule.register([CLOUD_GRPC_CONFIG])],
  exports: [ClientsModule],
})
export class CloudModule {}
