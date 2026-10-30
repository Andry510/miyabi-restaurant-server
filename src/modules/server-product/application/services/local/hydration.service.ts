import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import type { Product } from '../../../domain/entities';
import type {
  ICloudServerProductRepository,
  IProductRepository,
} from '../../../domain/interfaces/repositories';
import type { IHydrationService } from '../../../domain/interfaces/services';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
// oxlint-disable-next-line typescript/consistent-type-imports
import { RedisManager } from '@infrastructure/cache';
import { CACHE_KEY } from '@infrastructure/constants';
import { ProductMapper } from '../../../infrastructure/mappers';
import {
  SERVER_PRODUCT_LOGGER_NAME,
  SERVER_PRODUCT_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

@Injectable()
export class HydrationService implements IHydrationService, OnModuleInit {
  private readonly logger = new Logger(
    SERVER_PRODUCT_LOGGER_NAME.SERVICE.HYDRATION,
  );

  private queue: Promise<void> = Promise.resolve();
  private hydrationQueued = false;

  constructor(
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
    @Inject(SERVER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.PRODUCT)
    private readonly product_repository: IProductRepository,
    @Inject(SERVER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SERVER_PRODUCT)
    private readonly cloud_server_product_repository: ICloudServerProductRepository,
    private readonly cache: RedisManager,
  ) {}

  onModuleInit(): void {
    this.socket_service.on(SOCKET_EVENT.SERVER_SYNC_REQUIRED, () =>
      this.hydrate(),
    );
    this.socket_service.on(SOCKET_EVENT.PRODUCT_CREATED, (payload) =>
      this.save(payload),
    );
    this.socket_service.on(SOCKET_EVENT.PRODUCT_UPDATED, (payload) =>
      this.save(payload),
    );
    this.socket_service.on(SOCKET_EVENT.PRODUCT_REMOVED, (payload) =>
      this.remove(payload),
    );
  }

  hydrate(): Promise<void> {
    if (this.hydrationQueued) {
      return this.queue;
    }

    this.hydrationQueued = true;

    return this.enqueue(async () => {
      this.hydrationQueued = false;
      await this.runHydration();
    });
  }

  save(payload: unknown): Promise<void> {
    return this.enqueue(async () => {
      const productResult = ProductMapper.fromCloud(payload);

      if (productResult.IsFailure) {
        this.logger.error(SYSTEM_MESSAGE.ERROR.HYDRATION_INVALID_PRODUCT);
        this.logger.error(productResult.Error);
        return;
      }

      const upsertResult = await this.product_repository.upsert(
        productResult.Value,
      );

      if (upsertResult.IsFailure) {
        this.logger.error(upsertResult.Error);
        return;
      }

      this.logger.info(
        SYSTEM_MESSAGE.SUCCESS.PRODUCT_SAVED(productResult.Value.CloudId),
      );
    });
  }

  remove(payload: unknown): Promise<void> {
    return this.enqueue(async () => {
      const idResult = ProductMapper.removedIdFromCloud(payload);

      if (idResult.IsFailure) {
        this.logger.error(idResult.Error);
        return;
      }

      const removeResult = await this.product_repository.removeByCloudId(
        idResult.Value,
      );

      if (removeResult.IsFailure) {
        this.logger.error(removeResult.Error);
        return;
      }

      this.logger.info(SYSTEM_MESSAGE.SUCCESS.PRODUCT_REMOVED(idResult.Value));
    });
  }

  //Functions
  private enqueue(task: () => Promise<void>): Promise<void> {
    const run = this.queue.then(task).catch((error: unknown) => {
      this.logger.error(error);
    });

    this.queue = run;

    return run;
  }

  private async runHydration(): Promise<void> {
    const syncedAtResult = await this.product_repository.findSyncedAt();

    if (syncedAtResult.IsFailure) {
      this.logger.error(syncedAtResult.Error);
      return;
    }

    const cloudResult =
      await this.cloud_server_product_repository.serverProducts(
        syncedAtResult.Value,
      );

    if (cloudResult.IsFailure) {
      this.logger.error(cloudResult.Error);
      return;
    }

    const { data, removed_ids, synced_at } = cloudResult.Value;

    const products: Product[] = [];

    for (const item of data) {
      const productResult = ProductMapper.fromCloud(item);

      if (productResult.IsFailure) {
        this.logger.error(SYSTEM_MESSAGE.ERROR.HYDRATION_INVALID_PRODUCT);
        this.logger.error(productResult.Error);
        continue;
      }

      products.push(productResult.Value);
    }

    const applyResult = await this.product_repository.applySync({
      products,
      removed_ids,
      synced_at,
    });

    if (applyResult.IsFailure) {
      this.logger.error(applyResult.Error);
      return;
    }

    await this.cache.forget(CACHE_KEY.SETTINGS);

    this.logger.info(
      SYSTEM_MESSAGE.SUCCESS.HYDRATION_APPLIED(
        products.length,
        removed_ids.length,
        data.length - products.length,
      ),
    );
  }
}
