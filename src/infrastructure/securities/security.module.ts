import { Global, Module } from '@nestjs/common';

import { JwtManager } from './jwt.security';

@Global()
@Module({
  providers: [JwtManager],
  exports: [JwtManager],
})
export class SecurityModule {}
