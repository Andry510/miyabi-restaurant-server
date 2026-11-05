import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Patch,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_ME_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_ME_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  NotificationsQueryDto,
  ReadNotificationsBodyDto,
} from '../../../../../notification/application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { INotificationService } from '../../../../domain/interfaces/services';
import type {
  TNotificationsQuerySchema,
  TReadNotificationsBodySchema,
} from '../../../../../notification/domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class NotificationHttpController {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.SERVICES.NOTIFICATION)
    private readonly service: INotificationService,
  ) {}

  @Get(HTTP_CLOUD_ME_ROUTER.NOTIFICATION.NOTIFICATIONS)
  async notifications(
    @HttpAuthorization() access_token: string | null,
    @Query() query: NotificationsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TNotificationsQuerySchema;

    const listResult = await this.service.notifications(input, access_token);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ME_MESSAGE.SUCCESS.NOTIFICATIONS_RETRIEVED,
      listResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_CLOUD_ME_ROUTER.NOTIFICATION.UNREAD_COUNT)
  async unreadCount(
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const countResult = await this.service.unreadCount(access_token);

    if (countResult.IsFailure) {
      return HttpErrorMapper.reply(res, countResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ME_MESSAGE.SUCCESS.UNREAD_COUNT_RETRIEVED,
      countResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_CLOUD_ME_ROUTER.NOTIFICATION.READ)
  async read(
    @HttpAuthorization() access_token: string | null,
    @Body() body: ReadNotificationsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TReadNotificationsBodySchema;

    const readResult = await this.service.read(
      input.notification_ids,
      access_token,
    );

    if (readResult.IsFailure) {
      return HttpErrorMapper.reply(res, readResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ME_MESSAGE.SUCCESS.NOTIFICATIONS_READ,
      readResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
