import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

//Common
import {
  HttpLocalAccessGuard,
  HttpManagerAccessGuard,
  HttpPairingGuard,
} from '@common/guards';

//Modules
import * as Modules from './modules';

//Infrastructure
import { CacheModule } from '@infrastructure/cache';
import { DatabaseModule } from '@infrastructure/database';
import { CloudModule } from '@infrastructure/grpc/cloud';
import { SecurityModule } from '@infrastructure/securities';

@Module({
  imports: [
    CacheModule,
    DatabaseModule,
    CloudModule,
    SecurityModule,
    ...Object.values(Modules),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpPairingGuard,
    },
    {
      provide: APP_GUARD,
      useClass: HttpLocalAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: HttpManagerAccessGuard,
    },
  ],
})
export class AppModule {}
