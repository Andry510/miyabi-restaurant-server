import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_ORDER_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type {
  IOrderRepository,
  IRequestRepository,
} from '../../../domain/interfaces/repositories';
import type { IRequestService } from '../../../domain/interfaces/services';
import type {
  TMineQuerySchema,
  TRequestBodySchema,
  TUpdateRequestSchema,
} from '../../../domain/schemas';
import type { TMyRequestOutput } from '../../../domain/types/entities';
import type { TRequestChangeResult } from '../../../domain/types/repositories';
import type { INotificationService } from '../../../../notification/domain/interfaces/services';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone } from '@infrastructure/utils';
import {
  ORDER_LOGGER_NAME,
  ORDER_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import {
  NOTIFICATION_ENTITY,
  NOTIFICATION_PROVIDER_TOKENS,
  NOTIFICATION_TEMPLATE,
} from '../../../../notification/infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

const SAVE_ATTEMPTS = 2;

@Injectable()
export class RequestService implements IRequestService {
  private readonly logger = new Logger(ORDER_LOGGER_NAME.SERVICE.REQUEST);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION)
    private readonly notification_service: INotificationService,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(ORDER_PROVIDER_TOKENS.REPOSITORIES.ORDER)
    private readonly order_repository: IOrderRepository,
    @Inject(ORDER_PROVIDER_TOKENS.REPOSITORIES.REQUEST)
    private readonly request_repository: IRequestRepository,
  ) {}

  //<--------- Validations --------->

  private changed<T>(
    changeResult: ResultPattern<TRequestChangeResult<T>>,
  ): ResultPattern<T, ServiceError> {
    if (changeResult.IsFailure) {
      this.logger.error(changeResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const result = changeResult.Value;

    if (result.kind === 'not_found') {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.REQUEST_NOT_FOUND,
      );
    }

    if (result.kind === 'not_open') {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
      );
    }

    return ServiceResultMapper.Ok(result.value);
  }

  //<--------- Service --------->

  async save(
    user: TUserDetail,
    input: TRequestBodySchema,
  ): Promise<ResultPattern<TMyRequestOutput, ServiceError>> {
    const assignment = user.assignment;

    if (!assignment) {
      return ServiceResultMapper.Conflict(
        API_ORDER_MESSAGE.ERROR.WITHOUT_ASSIGNMENT,
      );
    }

    const [settingsResult, inAreaResult] = await Promise.all([
      this.setting_service.settings(),
      this.request_repository.isProductInArea(
        input.product_id,
        assignment.work_area.id,
      ),
    ]);

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    if (inAreaResult.IsFailure) {
      this.logger.error(inAreaResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!inAreaResult.Value) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.PRODUCT_NOT_IN_AREA,
      );
    }

    const businessDate = TimeZone.dayOf(
      new Date(),
      settingsResult.Value.timezone,
    );

    for (let attempt = 0; attempt < SAVE_ATTEMPTS; attempt++) {
      const orderResult = await this.order_repository.openOrderId(businessDate);

      if (orderResult.IsFailure) {
        this.logger.error(orderResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      const saveResult = await this.request_repository.save({
        order_id: orderResult.Value,
        assignment_id: assignment.id,
        product_id: input.product_id,
        quantity: input.quantity,
        note: input.note ?? null,
      });

      if (saveResult.IsFailure) {
        this.logger.error(saveResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      const saved = saveResult.Value;

      if (saved?.created) {
        void this.notification_service.notify({
          template_code: NOTIFICATION_TEMPLATE.ORDER_REQUEST_SUBMITTED,
          data: {
            employee: `${user.first_name} ${user.last_name}`,
            area: assignment.work_area.name,
            quantity: saved.request.quantity,
            product: saved.request.product.name,
          },
          entity_type: NOTIFICATION_ENTITY.ORDER,
          entity_id: saved.request.order.id,
        });
      }

      if (saved) {
        return ServiceResultMapper.Ok(saved.request);
      }
    }

    return ServiceResultMapper.Conflict(API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN);
  }

  async update(
    user: TUserDetail,
    id: string,
    input: TUpdateRequestSchema,
  ): Promise<ResultPattern<TMyRequestOutput, ServiceError>> {
    if (!user.assignment) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.REQUEST_NOT_FOUND,
      );
    }

    return this.changed(
      await this.request_repository.update(id, user.assignment.id, input),
    );
  }

  async remove(
    user: TUserDetail,
    id: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    if (!user.assignment) {
      return ServiceResultMapper.NotFound(
        API_ORDER_MESSAGE.ERROR.REQUEST_NOT_FOUND,
      );
    }

    return this.changed(
      await this.request_repository.remove(id, user.assignment.id),
    );
  }

  async mine(
    user: TUserDetail,
    input: TMineQuerySchema,
  ): Promise<ResultPattern<TMyRequestOutput[], ServiceError>> {
    if (!user.assignment) {
      return ServiceResultMapper.Ok([]);
    }

    const mineResult = await this.request_repository.findMine(
      user.assignment.id,
      input.from,
      input.to,
    );

    if (mineResult.IsFailure) {
      this.logger.error(mineResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(mineResult.Value);
  }
}
