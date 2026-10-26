import type { PrismaClient } from '@generated/prisma/client';
import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Infrastructure
import { prisma } from './cli';
import { Logger } from '@infrastructure/audits';

@Injectable()
export class DatabaseManager implements OnModuleInit, OnModuleDestroy {
  private readonly prismaClient: PrismaClient;

  private readonly logger = new Logger(DatabaseManager.name);

  constructor() {
    this.prismaClient = prisma;
  }

  get PrimaryDBClient(): PrismaClient {
    return this.prismaClient;
  }

  onModuleInit(): void {
    void this.prismaClient
      .$connect()
      .then(() => this.logger.info(SYSTEM_MESSAGE.SUCCESS.DATABASE_CONNECTED))
      .catch(() =>
        this.logger.error(SYSTEM_MESSAGE.ERROR.DATABASE_CONNECTION_FAILED),
      );
  }

  onModuleDestroy(): void {
    void this.prismaClient
      .$disconnect()
      .then(() =>
        this.logger.info(SYSTEM_MESSAGE.SUCCESS.DATABASE_DISCONNECTED),
      )
      .catch(() =>
        this.logger.error(SYSTEM_MESSAGE.ERROR.DATABASE_DISCONNECTION_FAILED),
      );
  }
}
