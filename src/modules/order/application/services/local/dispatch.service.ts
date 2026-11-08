import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import { SERVICE_ERROR_CODE } from '@domain/enums/shared';
import type { IOrderRepository } from '../../../domain/interfaces/repositories';
import type { IDispatchService } from '../../../domain/interfaces/services';
import type {
  TDispatchResult,
  TDispatchToSend,
} from '../../../domain/types/repositories';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';
import type { INotificationService } from '../../../../notification/domain/interfaces/services';
import type { ITransferService } from '../../../../transfer/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import {
  ORDER_LIMITS,
  ORDER_LOGGER_NAME,
  ORDER_PROVIDER_TOKENS,
  ORDER_RETRYABLE_ERRORS,
} from '../../../infrastructure/constants';
import {
  CHANNEL_EVENT,
  CHANNEL_PROVIDER_TOKENS,
} from '../../../../channel/infrastructure/constants';
import {
  NOTIFICATION_ENTITY,
  NOTIFICATION_PROVIDER_TOKENS,
  NOTIFICATION_TEMPLATE,
} from '../../../../notification/infrastructure/constants';
import { TRANSFER_PROVIDER_TOKENS } from '../../../../transfer/infrastructure/constants';

@Injectable()
export class DispatchService implements IDispatchService, OnModuleInit {
  private readonly logger = new Logger(ORDER_LOGGER_NAME.SERVICE.DISPATCH);
  private readonly sending = new Set<string>();
  private lastPendingNoticeAt = 0;

  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION)
    private readonly notification_service: INotificationService,
    @Inject(TRANSFER_PROVIDER_TOKENS.SERVICES.TRANSFER)
    private readonly transfer_service: ITransferService,
    @Inject(ORDER_PROVIDER_TOKENS.REPOSITORIES.ORDER)
    private readonly order_repository: IOrderRepository,
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
  ) {}

  onModuleInit(): void {
    this.channel_service.on(CHANNEL_EVENT.SYNC_REQUIRED, () =>
      this.noticePending(),
    );
  }

  isSending(orderId: string): boolean {
    return this.sending.has(orderId);
  }

  claim(orderId: string): boolean {
    if (this.sending.has(orderId)) {
      return false;
    }

    this.sending.add(orderId);
    return true;
  }

  release(orderId: string): void {
    this.sending.delete(orderId);
  }

  async dispatch(
    orderId: string,
    dispatches: TDispatchToSend[],
    accessToken: string | null,
  ): Promise<boolean> {
    const results: TDispatchResult[] = [];
    let unreachableError: string | null = null;

    for (const dispatch of dispatches) {
      if (unreachableError) {
        results.push({
          id: dispatch.id,
          sent: false,
          error: unreachableError,
          retryable: true,
        });
        continue;
      }

      const registerResult = await this.transfer_service.register(
        {
          ...(dispatch.to_location_id
            ? { to_location_id: dispatch.to_location_id }
            : {}),
          idempotency_key: dispatch.idempotency_key,
          items: dispatch.items.map((item) => ({
            product_id: item.cloud_product_id,
            requested_qty: String(item.quantity),
          })),
        },
        accessToken,
      );

      if (registerResult.IsSuccess) {
        results.push({
          id: dispatch.id,
          sent: true,
          transfer_id: registerResult.Value.id,
        });
        continue;
      }

      const { code, message_code } = registerResult.Error;

      results.push({
        id: dispatch.id,
        sent: false,
        error: message_code,
        retryable: ORDER_RETRYABLE_ERRORS.includes(code),
      });

      if (code === SERVICE_ERROR_CODE.UNAVAILABLE) {
        unreachableError = message_code;
      }
    }

    const finishResult = await this.order_repository.finishSend(
      orderId,
      results,
    );

    if (finishResult.IsFailure) {
      this.logger.error(finishResult.Error);
    }

    const failed = results.filter((result) => !result.sent).length;

    if (finishResult.IsSuccess && failed > 0) {
      void this.notification_service.notify({
        template_code: NOTIFICATION_TEMPLATE.ORDER_DISPATCH_FAILED,
        data: { count: failed },
        entity_type: NOTIFICATION_ENTITY.ORDER,
        entity_id: orderId,
      });
    }

    this.channel_service.reportStatus();

    return unreachableError === null;
  }

  //Functions
  private async noticePending(): Promise<void> {
    if (
      Date.now() - this.lastPendingNoticeAt <
      ORDER_LIMITS.PENDING_NOTICE_MS
    ) {
      return;
    }

    const idsResult = await this.order_repository.findRetryableOrderIds();

    if (idsResult.IsFailure) {
      this.logger.error(idsResult.Error);
      return;
    }

    const ids = idsResult.Value;

    if (ids.length === 0) {
      return;
    }

    this.lastPendingNoticeAt = Date.now();

    void this.notification_service.notify({
      template_code: NOTIFICATION_TEMPLATE.ORDER_DISPATCH_PENDING,
      data: { count: ids.length },
      entity_type: NOTIFICATION_ENTITY.ORDER,
      entity_id: ids.length === 1 ? ids[0] : null,
    });
  }
}
