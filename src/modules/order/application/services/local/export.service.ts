import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type {
  IExportService,
  IOrderService,
} from '../../../domain/interfaces/services';
import type { TOrderDetailOutput } from '../../../domain/types/entities';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Xlsx } from '@infrastructure/exporters';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { TimeZone, TokenPayload } from '@infrastructure/utils';
import {
  DISPATCH_STATUS_LABEL,
  ORDER_EXPORT_SHEET,
  ORDER_EXPORT_TEXT,
  ORDER_LOGGER_NAME,
  ORDER_PROVIDER_TOKENS,
  ORDER_STATUS_LABEL,
  UNIT_LABEL,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';

type TRow = Array<string | number | null>;

@Injectable()
export class ExportService implements IExportService {
  private readonly logger = new Logger(ORDER_LOGGER_NAME.SERVICE.EXPORT);

  constructor(
    @Inject(ORDER_PROVIDER_TOKENS.SERVICES.ORDER)
    private readonly order_service: IOrderService,
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
  ) {}

  async export(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>> {
    const [orderResult, settingsResult] = await Promise.all([
      this.order_service.order(id),
      this.setting_service.settings(),
    ]);

    if (orderResult.IsFailure) {
      return ResultPattern.Failure(orderResult.Error);
    }

    if (settingsResult.IsFailure) {
      return ResultPattern.Failure(settingsResult.Error);
    }

    const rows = this.rows(orderResult.Value, settingsResult.Value.timezone);

    const bufferResult = Xlsx.sheetExcel(
      TokenPayload.email(accessToken),
      ORDER_EXPORT_SHEET,
      rows,
    );

    if (bufferResult.IsFailure) {
      this.logger.error(bufferResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(bufferResult.Value);
  }

  //Functions
  private rows(order: TOrderDetailOutput, timeZone: string): TRow[] {
    const body = order.lines
      .filter((line) => line.quantity > 0)
      .sort((a, b) =>
        a.product.storage_code.localeCompare(b.product.storage_code),
      )
      .map((line) => {
        const dispatch = order.dispatches.find(
          (item) => item.to_location_id === line.to_location_id,
        );

        return [
          line.product.storage_code,
          line.product.name,
          UNIT_LABEL[line.product.unit] ?? line.product.unit,
          line.quantity,
          line.requested_quantity,
          dispatch
            ? DISPATCH_STATUS_LABEL[dispatch.status]
            : ORDER_EXPORT_TEXT.NOT_SENT,
          line.requests
            .filter((request) => request.note)
            .map(
              (request) =>
                `${request.user.first_name} ${request.user.last_name}: ${request.note}`,
            )
            .join(' | ') || null,
        ];
      });

    return [
      [ORDER_EXPORT_TEXT.TITLE],
      ['Fecha', order.business_date],
      ['Estado', ORDER_STATUS_LABEL[order.status]],
      ['Enviado por', order.sent_by],
      [
        'Enviado',
        order.sent_at ? TimeZone.format(order.sent_at, timeZone) : null,
      ],
      ['Exportado', TimeZone.format(new Date(), timeZone)],
      [],
      [...ORDER_EXPORT_TEXT.HEADER],
      ...body,
    ];
  }
}
