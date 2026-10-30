import { Global, Module } from '@nestjs/common';

import { RedisManager } from './redis';

@Global()
@Module({
  providers: [RedisManager],
  exports: [RedisManager],
})
export class CacheModule {}
