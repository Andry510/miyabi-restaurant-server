import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import type { INotificationRepository } from '../../../domain/interfaces/repositories';
import type { INotificationService } from '../../../domain/interfaces/services';
import type {
  TNotificationValue,
  TNotifyInput,
} from '../../../domain/types/entities';
import type { ISettingService } from '../../../../setting/domain/interfaces/services';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { TimeZone } from '@infrastructure/utils';
import {
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_LOGGER_NAME,
  NOTIFICATION_PROVIDER_TOKENS,
  NOTIFICATION_TEMPLATES,
} from '../../../infrastructure/constants';
import { SETTING_PROVIDER_TOKENS } from '../../../../setting/infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

const PLACEHOLDER = /{{\s*(\w+)\s*}}/g;

@Injectable()
export class NotificationService implements INotificationService, OnModuleInit {
  private readonly logger = new Logger(
    NOTIFICATION_LOGGER_NAME.SERVICE.NOTIFICATION,
  );

  private templatesReady = false;

  constructor(
    @Inject(SETTING_PROVIDER_TOKENS.SERVICES.SETTING)
    private readonly setting_service: ISettingService,
    @Inject(NOTIFICATION_PROVIDER_TOKENS.REPOSITORIES.NOTIFICATION)
    private readonly notification_repository: INotificationRepository,
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureTemplates();
  }

  async notify(input: TNotifyInput): Promise<void> {
    try {
      await this.create(input);
    } catch (error) {
      this.logger.error(error);
    }
  }

  //Functions
  private async create(input: TNotifyInput): Promise<void> {
    if (!this.templatesReady) {
      await this.ensureTemplates();
    }

    const templateResult = await this.notification_repository.findTemplate(
      input.template_code,
    );

    if (templateResult.IsFailure) {
      this.logger.error(templateResult.Error);
      return;
    }

    const template = templateResult.Value;

    if (!template?.status) {
      return;
    }

    const userIds =
      template.audience === NOTIFICATION_AUDIENCE.EMPLOYEE
        ? [...new Set(input.user_ids ?? [])]
        : [null];

    if (userIds.length === 0) {
      return;
    }

    const settingsResult = await this.setting_service.settings();

    if (settingsResult.IsFailure) {
      return;
    }

    const data = this.format(input.data, settingsResult.Value.timezone);

    const createResult = await this.notification_repository.createMany({
      audience: template.audience,
      user_ids: userIds,
      template_code: input.template_code,
      data,
      title: this.render(template.title, data),
      body: this.render(template.body, data),
      entity_type: input.entity_type,
      entity_id: input.entity_id,
    });

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return;
    }

    for (const { user_id, notification } of createResult.Value) {
      if (user_id) {
        this.socket_service.emitToEmployee(
          user_id,
          SOCKET_EVENT.NOTIFICATION_CREATED,
          notification,
        );
      } else {
        this.socket_service.emitToManagers(
          SOCKET_EVENT.NOTIFICATION_CREATED,
          notification,
        );
      }
    }
  }

  private async ensureTemplates(): Promise<void> {
    const ensureResult = await this.notification_repository.ensureTemplates(
      NOTIFICATION_TEMPLATES,
    );

    if (ensureResult.IsFailure) {
      this.logger.error(ensureResult.Error);
      return;
    }

    this.templatesReady = true;
  }

  private format(
    data: Record<string, TNotificationValue>,
    timeZone: string,
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value instanceof Date
          ? TimeZone.format(value, timeZone)
          : String(value),
      ]),
    );
  }

  private render(text: string, data: Record<string, string>): string {
    return text.replace(PLACEHOLDER, (_match, key: string) => data[key] ?? '');
  }
}
