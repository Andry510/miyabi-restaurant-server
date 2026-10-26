import { Global, Module } from '@nestjs/common';
import { DatabaseManager } from './database.service';

@Global()
@Module({
  providers: [DatabaseManager],
  exports: [DatabaseManager],
})
export class DatabaseModule {}
