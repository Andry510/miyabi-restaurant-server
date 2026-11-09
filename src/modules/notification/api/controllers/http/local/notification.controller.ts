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
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  NOTIFICATION_TAG,
  NOTIFICATION_LOCAL_EMPLOYEE_NOTIFICATIONS_DOCS,
  NOTIFICATION_LOCAL_EMPLOYEE_READ_DOCS,
  NOTIFICATION_LOCAL_EMPLOYEE_UNREAD_COUNT_DOCS,
  NOTIFICATION_LOCAL_MANAGER_NOTIFICATIONS_DOCS,
  NOTIFICATION_LOCAL_MANAGER_READ_DOCS,
  NOTIFICATION_LOCAL_MANAGER_UNREAD_COUNT_DOCS,
} from '../../../swagger';
import { API_NOTIFICATION_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_NOTIFICATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  NotificationsQueryDto,
  ReadNotificationsBodyDto,
} from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpLocalAccess, HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization, HttpUser } from '@common/decorators/request';
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import { ServiceErrorFactory } from '@domain/patterns/errors';
import type { IReaderService } from '../../../../domain/interfaces/services';
import type {
  TNotificationsQuerySchema,
  TReadNotificationsBodySchema,
} from '../../../../domain/schemas';
import type { TNotificationReader } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TokenPayload } from '@infrastructure/utils';
import { NOTIFICATION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(NOTIFICATION_TAG)
export class NotificationHttpController {
  constructor(
    @Inject(NOTIFICATION_PROVIDER_TOKENS.SERVICES.READER)
    private readonly service: IReaderService,
  ) {}

  @HttpDocs(NOTIFICATION_LOCAL_EMPLOYEE_NOTIFICATIONS_DOCS)
  @Get(HTTP_LOCAL_NOTIFICATION_ROUTER.EMPLOYEE.NOTIFICATIONS)
  @HttpLocalAccess()
  employeeNotifications(
    @HttpUser('id') userId: string,
    @Query() query: NotificationsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.notifications(
      { audience: 'employee', user_id: userId },
      query as unknown as TNotificationsQuerySchema,
      res,
    );
  }

  @HttpDocs(NOTIFICATION_LOCAL_EMPLOYEE_UNREAD_COUNT_DOCS)
  @Get(HTTP_LOCAL_NOTIFICATION_ROUTER.EMPLOYEE.UNREAD_COUNT)
  @HttpLocalAccess()
  employeeUnreadCount(
    @HttpUser('id') userId: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.unreadCount({ audience: 'employee', user_id: userId }, res);
  }

  @HttpDocs(NOTIFICATION_LOCAL_EMPLOYEE_READ_DOCS)
  @Patch(HTTP_LOCAL_NOTIFICATION_ROUTER.EMPLOYEE.READ)
  @HttpLocalAccess()
  employeeRead(
    @HttpUser('id') userId: string,
    @Body() body: ReadNotificationsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.read(
      { audience: 'employee', user_id: userId },
      body as unknown as TReadNotificationsBodySchema,
      res,
    );
  }

  @HttpDocs(NOTIFICATION_LOCAL_MANAGER_NOTIFICATIONS_DOCS)
  @Get(HTTP_LOCAL_NOTIFICATION_ROUTER.MANAGER.NOTIFICATIONS)
  @HttpManagerAccess()
  managerNotifications(
    @HttpAuthorization() access_token: string | null,
    @Query() query: NotificationsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.notifications(
      this.managerReader(access_token),
      query as unknown as TNotificationsQuerySchema,
      res,
    );
  }

  @HttpDocs(NOTIFICATION_LOCAL_MANAGER_UNREAD_COUNT_DOCS)
  @Get(HTTP_LOCAL_NOTIFICATION_ROUTER.MANAGER.UNREAD_COUNT)
  @HttpManagerAccess()
  managerUnreadCount(
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    return this.unreadCount(this.managerReader(access_token), res);
  }

  @HttpDocs(NOTIFICATION_LOCAL_MANAGER_READ_DOCS)
  @Patch(HTTP_LOCAL_NOTIFICATION_ROUTER.MANAGER.READ)
  @HttpManagerAccess()
  managerRead(
    @HttpAuthorization() access_token: string | null,
    @Body() body: ReadNotificationsBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.read(
      this.managerReader(access_token),
      body as unknown as TReadNotificationsBodySchema,
      res,
    );
  }

  //Functions
  private async notifications(
    reader: TNotificationReader | null,
    input: TNotificationsQuerySchema,
    res: Response,
  ): Promise<Response> {
    if (!reader) {
      return this.unauthorized(res);
    }

    const listResult = await this.service.notifications(reader, input);

    if (listResult.IsFailure) {
      return HttpErrorMapper.reply(res, listResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_RETRIEVED,
      listResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  private async unreadCount(
    reader: TNotificationReader | null,
    res: Response,
  ): Promise<Response> {
    if (!reader) {
      return this.unauthorized(res);
    }

    const countResult = await this.service.unreadCount(reader);

    if (countResult.IsFailure) {
      return HttpErrorMapper.reply(res, countResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_NOTIFICATION_MESSAGE.SUCCESS.UNREAD_COUNT_RETRIEVED,
      countResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  private async read(
    reader: TNotificationReader | null,
    input: TReadNotificationsBodySchema,
    res: Response,
  ): Promise<Response> {
    if (!reader) {
      return this.unauthorized(res);
    }

    const readResult = await this.service.read(reader, input);

    if (readResult.IsFailure) {
      return HttpErrorMapper.reply(res, readResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_NOTIFICATION_MESSAGE.SUCCESS.NOTIFICATIONS_READ,
      readResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  private managerReader(
    accessToken: string | null,
  ): TNotificationReader | null {
    const email = TokenPayload.email(accessToken);

    return email ? { audience: 'manager', email } : null;
  }

  private unauthorized(res: Response): Response {
    return HttpErrorMapper.reply(
      res,
      ServiceErrorFactory.Unauthorized(API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN),
    );
  }
}
