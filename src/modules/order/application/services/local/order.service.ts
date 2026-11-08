import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_ORDER_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ORDER_STATUS } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import { OrderAggregate } from '../../../domain/aggregates';
import type { IOrderRepository } from '../../../domain/interfaces/repositories';
import type {
  IDispatchService,
  IOrderService,
} from '../../../domain/interfaces/services';
import type {
  TItemBodySchema,
  TOrdersQuerySchema,
} from '../../../domain/schemas';
import type {
  TOrderDetailOutput,
  TOrderOutput,
} from '../../../domain/types/entities';
import type {
  TOrderDraft,
  TOrderLine,
} from '../../../domain/types/repositories';
import type { ICatalogService } from '../../../../repository/domain/interfaces/services';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone, TokenPayload } from '@infrastructure/utils';
import {
  ORDER_LOGGER_NAME,
  ORDER_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { OrderMapper } from '../../../infrastructure/mappers';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

type TOrderState = { draft: TOrderDraft; lines: TOrderLine[] };

@Injectable()
export class OrderService implements IOrderService {
  private readonly logger = new Logger(ORDER_LOGGER_NAME.SERVICE.ORDER);

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG)
    private readonly catalog_service: ICatalogService,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(ORDER_PROVIDER_TOKENS.SERVICES.DISPATCH)
    private readonly dispatch_service: IDispatchService,
    @Inject(ORDER_PROVIDER_TOKENS.REPOSITORIES.ORDER)
    private readonly order_repository: IOrderRepository,
  ) {}

  //<--------- Validations --------->

  private async state(
    id: string,
  ): Promise<ResultPattern<TOrderState | null, ServiceError>> {
    const draftResult = await this.order_repository.findDraft(id);

    if (draftResult.IsFailure) {
      this.logger.error(draftResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const draft = draftResult.Value;

    if (!draft) {
      return ServiceResultMapper.Ok(null);
    }

    const suggestionsResult =
      draft.header.status === ORDER_STATUS.OPEN
        ? await this.order_repository.findSuggestions([
            ...new Set([
              ...draft.requests.map((request) => request.product.id),
              ...draft.items.map((item) => item.product.id),
            ]),
          ])
        : ResultPattern.Success(new Map<string, string>());

    if (suggestionsResult.IsFailure) {
      this.logger.error(suggestionsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok({
      draft,
      lines: OrderAggregate.register(draft, suggestionsResult.Value).Lines,
    });
  }

  private async openOrderId(): Promise<ResultPattern<string, ServiceError>> {
    const openResult = await this.order_repository.findOpenOrderId();

    if (openResult.IsFailure) {
      this.logger.error(openResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!openResult.Value) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.NO_OPEN_ORDER,
      );
    }

    return ServiceResultMapper.Ok(openResult.Value);
  }

  //<--------- Service --------->

  async current(): Promise<
    ResultPattern<TOrderDetailOutput | null, ServiceError>
  > {
    const openResult = await this.order_repository.findOpenOrderId();

    if (openResult.IsFailure) {
      this.logger.error(openResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!openResult.Value) {
      return ServiceResultMapper.Ok(null);
    }

    return this.order(openResult.Value);
  }

  async saveItem(
    productId: string,
    input: TItemBodySchema,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>> {
    const [existResult, settingsResult] = await Promise.all([
      this.catalog_service.productsExist([productId]),
      this.setting_service.settings(),
    ]);

    if (existResult.IsFailure) {
      return ResultPattern.Failure(existResult.Error);
    }

    if (!existResult.Value) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
      );
    }

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const orderResult = await this.order_repository.openOrderId(
      TimeZone.dayOf(new Date(), settingsResult.Value.timezone),
    );

    if (orderResult.IsFailure) {
      this.logger.error(orderResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const saveResult = await this.order_repository.saveItem(
      orderResult.Value,
      productId,
      input.quantity,
      input.to_location_id ?? null,
    );

    if (saveResult.IsFailure) {
      this.logger.error(saveResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!saveResult.Value) {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
      );
    }

    return this.order(orderResult.Value);
  }

  async resetItem(
    productId: string,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>> {
    const openResult = await this.openOrderId();

    if (openResult.IsFailure) {
      return ResultPattern.Failure(openResult.Error);
    }

    const resetResult = await this.order_repository.resetItem(
      openResult.Value,
      productId,
    );

    if (resetResult.IsFailure) {
      this.logger.error(resetResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return this.order(openResult.Value);
  }

  async send(
    accessToken: string | null,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>> {
    const openResult = await this.openOrderId();

    if (openResult.IsFailure) {
      return ResultPattern.Failure(openResult.Error);
    }

    const id = openResult.Value;
    const stateResult = await this.state(id);

    if (stateResult.IsFailure) {
      return ResultPattern.Failure(stateResult.Error);
    }

    const lines = stateResult.Value?.lines ?? [];
    const toSend = lines.filter((line) => line.quantity > 0);

    if (toSend.length === 0) {
      return ServiceResultMapper.Conflict(API_ORDER_MESSAGE.ERROR.EMPTY_ORDER);
    }

    if (!this.dispatch_service.claim(id)) {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.ORDER_SENDING,
      );
    }

    try {
      const startResult = await this.order_repository.startSend(
        id,
        lines,
        OrderAggregate.plan(lines, () => randomUUID()),
        TokenPayload.email(accessToken),
      );

      if (startResult.IsFailure) {
        this.logger.error(startResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      if (!startResult.Value) {
        return ServiceResultMapper.Conflict(
          API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
        );
      }

      await this.dispatch_service.dispatch(id, startResult.Value, accessToken);
    } finally {
      this.dispatch_service.release(id);
    }

    return this.order(id);
  }

  async retry(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>> {
    if (!this.dispatch_service.claim(id)) {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.ORDER_SENDING,
      );
    }

    try {
      const pendingResult = await this.order_repository.findPendingDispatches(
        id,
        false,
      );

      if (pendingResult.IsFailure) {
        this.logger.error(pendingResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      const pending = pendingResult.Value;

      if (!pending || pending.length === 0) {
        const orderResult = await this.order(id);

        return orderResult.IsFailure
          ? orderResult
          : ServiceResultMapper.Conflict(
              API_ORDER_MESSAGE.ERROR.NOTHING_TO_RETRY,
            );
      }

      await this.dispatch_service.dispatch(id, pending, accessToken);
    } finally {
      this.dispatch_service.release(id);
    }

    return this.order(id);
  }

  async retryAll(
    accessToken: string | null,
  ): Promise<ResultPattern<TOrderDetailOutput[], ServiceError>> {
    const idsResult = await this.order_repository.findRetryableOrderIds();

    if (idsResult.IsFailure) {
      this.logger.error(idsResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const ids = idsResult.Value.filter(
      (id) => !this.dispatch_service.isSending(id),
    );

    if (ids.length === 0) {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.NO_PENDING_ORDERS,
      );
    }

    const orders: TOrderDetailOutput[] = [];

    for (const id of ids) {
      if (!this.dispatch_service.claim(id)) {
        continue;
      }

      let reachable = true;

      try {
        const pendingResult = await this.order_repository.findPendingDispatches(
          id,
          true,
        );

        if (pendingResult.IsFailure) {
          this.logger.error(pendingResult.Error);
          continue;
        }

        if (!pendingResult.Value || pendingResult.Value.length === 0) {
          continue;
        }

        reachable = await this.dispatch_service.dispatch(
          id,
          pendingResult.Value,
          accessToken,
        );
      } finally {
        this.dispatch_service.release(id);
      }

      const orderResult = await this.order(id);

      if (orderResult.IsSuccess) {
        orders.push(orderResult.Value);
      }

      if (!reachable) {
        break;
      }
    }

    return ServiceResultMapper.Ok(orders);
  }

  async orders(
    input: TOrdersQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TOrderOutput>, ServiceError>> {
    const listResult = await this.order_repository.findMany(input);

    if (listResult.IsFailure) {
      this.logger.error(listResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const { count, data } = listResult.Value;

    return ServiceResultMapper.Pagination(data, input.page, input.limit, count);
  }

  async order(
    id: string,
  ): Promise<ResultPattern<TOrderDetailOutput, ServiceError>> {
    const stateResult = await this.state(id);

    if (stateResult.IsFailure) {
      return ResultPattern.Failure(stateResult.Error);
    }

    if (!stateResult.Value) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
      );
    }

    const { draft, lines } = stateResult.Value;

    return ServiceResultMapper.Ok(
      OrderMapper.toDetail(draft.header, lines, draft.dispatches),
    );
  }
}
