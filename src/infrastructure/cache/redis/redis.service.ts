import { Redis } from 'ioredis';
import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import { ResultPattern } from '@domain/patterns/results';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';

@Injectable()
export class RedisManager implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  private readonly logger = new Logger(RedisManager.name);

  constructor() {
    this.client = new Redis(Env.REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
  }

  onModuleInit(): void {
    void this.client
      .connect()
      .then(() => this.logger.info(SYSTEM_MESSAGE.SUCCESS.CACHE_CONNECTED))
      .catch(() =>
        this.logger.error(SYSTEM_MESSAGE.ERROR.CACHE_CONNECTION_FAILED),
      );
  }

  onModuleDestroy(): void {
    void this.client.quit().catch(() => undefined);
  }

  get = async <T>(key: string): Promise<T | null> => {
    const getResult = await ResultPattern.tryCatchAsync(
      'Infrastructure',
      RedisManager.name,
      () => this.client.get(key),
    );

    if (getResult.IsFailure) {
      this.logger.warn(getResult.Error);
      return null;
    }

    return getResult.Value ? (JSON.parse(getResult.Value) as T) : null;
  };

  set = async (
    key: string,
    value: unknown,
    ttlSeconds: number,
    group?: string,
  ): Promise<void> => {
    const setResult = await ResultPattern.tryCatchAsync(
      'Infrastructure',
      RedisManager.name,
      () => {
        const transaction = this.client
          .multi()
          .set(key, JSON.stringify(value), 'EX', ttlSeconds);

        return group
          ? transaction.sadd(group, key).expire(group, ttlSeconds, 'GT').exec()
          : transaction.exec();
      },
    );

    if (setResult.IsFailure) {
      this.logger.warn(setResult.Error);
    }
  };

  forget = async (key: string): Promise<void> => {
    const forgetResult = await ResultPattern.tryCatchAsync(
      'Infrastructure',
      RedisManager.name,
      () => this.client.del(key),
    );

    if (forgetResult.IsFailure) {
      this.logger.warn(forgetResult.Error);
    }
  };

  forgetGroup = async (group: string): Promise<void> => {
    const forgetResult = await ResultPattern.tryCatchAsync(
      'Infrastructure',
      RedisManager.name,
      async () => {
        const keys = await this.client.smembers(group);

        await this.client.del(group, ...keys);
      },
    );

    if (forgetResult.IsFailure) {
      this.logger.error(forgetResult.Error);
    }
  };
}
