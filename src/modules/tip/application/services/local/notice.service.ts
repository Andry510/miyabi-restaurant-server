import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { INoticeService } from '../../../domain/interfaces/services';
import type { TTipPoolDetailOutput } from '../../../domain/types/entities';
import type { INotificationService } from '../../../../notification/domain/interfaces/services';

//Infrastructure
import {
  NOTIFICATION_ENTITY,
  NOTIFICATION_PROVIDER_TOKENS,
  NOTIFICATION_TEMPLATE,
} from '../../../../notification/infrastructure/constants';

@Injectable()
export class NoticeService implements INoticeService {
  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION)
    private readonly notification_service: INotificationService,
  ) {}

  closed(
    poolResult: ResultPattern<TTipPoolDetailOutput, ServiceError>,
  ): ResultPattern<TTipPoolDetailOutput, ServiceError> {
    if (poolResult.IsFailure) {
      return poolResult;
    }

    const pool = poolResult.Value;

    for (const allocation of pool.areas.flatMap((area) => area.allocations)) {
      void this.notification_service.notify({
        template_code: NOTIFICATION_TEMPLATE.TIP_POOL_CLOSED,
        user_ids: [allocation.user.id],
        data: {
          amount: allocation.amount.toFixed(2),
          from: pool.start_day,
          to: pool.end_day,
        },
        entity_type: NOTIFICATION_ENTITY.TIP_POOL,
        entity_id: pool.id,
      });
    }

    return poolResult;
  }

  sanctioned(
    userId: string,
    sanction: string,
    poolResult: ResultPattern<TTipPoolDetailOutput, ServiceError>,
  ): ResultPattern<TTipPoolDetailOutput, ServiceError> {
    if (poolResult.IsFailure) {
      return poolResult;
    }

    const pool = poolResult.Value;

    void this.notification_service.notify({
      template_code: NOTIFICATION_TEMPLATE.TIP_SANCTION_APPLIED,
      user_ids: [userId],
      data: { sanction, from: pool.start_day, to: pool.end_day },
      entity_type: NOTIFICATION_ENTITY.TIP_POOL,
      entity_id: pool.id,
    });

    return poolResult;
  }
}
