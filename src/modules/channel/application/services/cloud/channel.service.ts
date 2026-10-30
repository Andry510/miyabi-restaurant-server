import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Subject, type Subscription } from 'rxjs';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type {
  ICloudChannelRepository,
  IStatusRepository,
} from '../../../domain/interfaces/repositories';
import type { IChannelService } from '../../../domain/interfaces/services';
import type {
  TChannelEvent,
  TChannelHandler,
  TChannelRequest,
  TChannelRequestHandler,
  TCloudMessage,
  TServerMessage,
} from '../../../domain/types/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { GrpcState, SERVER_VERSION } from '@infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import {
  CHANNEL_EVENT,
  CHANNEL_FATAL_REASONS,
  CHANNEL_LIMITS,
  CHANNEL_LOGGER_NAME,
  CHANNEL_PROVIDER_TOKENS,
  CHANNEL_REQUEST,
} from '../../../infrastructure/constants';

const REJECTED_CODES: number[] = [
  GrpcState.UNAUTHENTICATED,
  GrpcState.PERMISSION_DENIED,
];

@Injectable()
export class ChannelService
  implements IChannelService, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(CHANNEL_LOGGER_NAME.SERVICE.CHANNEL);

  private readonly handlers = new Map<TChannelEvent, TChannelHandler[]>();
  private readonly requests = new Map<
    TChannelRequest,
    TChannelRequestHandler
  >();

  private upstream: Subject<TServerMessage> | null = null;
  private subscription: Subscription | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private statusTimer: NodeJS.Timeout | null = null;
  private pendingStatus: NodeJS.Timeout | null = null;
  private retryMs: number = CHANNEL_LIMITS.RETRY_MIN_MS;
  private lastStatusAt = 0;
  private stopped = false;

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
    @Inject(CHANNEL_PROVIDER_TOKENS.REPOSITORIES.CLOUD_CHANNEL)
    private readonly cloud_channel_repository: ICloudChannelRepository,
    @Inject(CHANNEL_PROVIDER_TOKENS.REPOSITORIES.STATUS)
    private readonly status_repository: IStatusRepository,
  ) {}

  onApplicationBootstrap(): void {
    this.connect();

    this.statusTimer = setInterval(
      () => this.reportStatus(),
      CHANNEL_LIMITS.STATUS_INTERVAL_MS,
    );
    this.statusTimer.unref();
  }

  onModuleDestroy(): void {
    this.stopped = true;
    this.close();

    for (const timer of [this.statusTimer, this.pendingStatus]) {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  on(event: TChannelEvent, handler: TChannelHandler): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  onRequest(request: TChannelRequest, handler: TChannelRequestHandler): void {
    this.requests.set(request, handler);
  }

  connect(): void {
    const tokenResult = this.repository_service.serverToken();

    if (tokenResult.IsFailure) {
      this.logger.info(SYSTEM_MESSAGE.ERROR.CHANNEL_NOT_PAIRED);
      return;
    }

    this.close();
    this.stopped = false;

    const upstream = new Subject<TServerMessage>();
    this.upstream = upstream;

    this.subscription = this.cloud_channel_repository
      .open(upstream.asObservable())
      .subscribe({
        next: (message) => this.receive(message),
        error: (error: unknown) => this.handleError(error),
        complete: () => this.scheduleRetry(),
      });
  }

  reportStatus(): void {
    if (!this.upstream) {
      return;
    }

    const wait =
      CHANNEL_LIMITS.STATUS_MIN_INTERVAL_MS - (Date.now() - this.lastStatusAt);

    if (wait > 0) {
      if (!this.pendingStatus) {
        this.pendingStatus = setTimeout(() => {
          this.pendingStatus = null;
          this.reportStatus();
        }, wait);
        this.pendingStatus.unref();
      }

      return;
    }

    this.lastStatusAt = Date.now();
    void this.sendStatus();
  }

  //Functions
  private receive(message: TCloudMessage): void {
    if (message.sync_required) {
      this.retryMs = CHANNEL_LIMITS.RETRY_MIN_MS;
      this.logger.info(SYSTEM_MESSAGE.SUCCESS.CHANNEL_CONNECTED);
      this.lastStatusAt = 0;
      this.reportStatus();
    }

    if (message.attendance_request && message.request_id) {
      void this.answer(
        message.request_id,
        CHANNEL_REQUEST.ATTENDANCE,
        message.attendance_request,
      );
    }

    if (message.session_expired) {
      const reason = message.session_expired.reason ?? '';

      this.logger.warn(SYSTEM_MESSAGE.ERROR.CHANNEL_CLOSED(reason));

      if (CHANNEL_FATAL_REASONS.includes(reason)) {
        this.stopped = true;
        this.close();
        return;
      }
    }

    for (const event of Object.values(CHANNEL_EVENT)) {
      if (message[event]) {
        void this.dispatch(event, message[event]);
      }
    }
  }

  private async dispatch(
    event: TChannelEvent,
    payload: unknown,
  ): Promise<void> {
    for (const handler of this.handlers.get(event) ?? []) {
      try {
        await handler(payload);
      } catch (error) {
        this.logger.error(SYSTEM_MESSAGE.ERROR.CHANNEL_HANDLER_FAILED(event));
        this.logger.error(error);
      }
    }
  }

  private async answer(
    requestId: string,
    request: TChannelRequest,
    params: unknown,
  ): Promise<void> {
    const handler = this.requests.get(request);

    if (!handler) {
      this.write({
        request_id: requestId,
        error: { code: 'ERROR_NOT_SUPPORTED', message: request },
      });
      return;
    }

    try {
      const result = await handler(params);

      this.write(
        result.IsSuccess
          ? { request_id: requestId, ...result.Value }
          : {
              request_id: requestId,
              error: {
                code: result.Error.message_code,
                message: result.Error.message,
              },
            },
      );
    } catch (error) {
      this.logger.error(SYSTEM_MESSAGE.ERROR.CHANNEL_REQUEST_FAILED(request));
      this.logger.error(error);
      this.write({
        request_id: requestId,
        error: { code: 'ERROR_INTERNAL_ERROR', message: request },
      });
    }
  }

  private async sendStatus(): Promise<void> {
    const snapshotResult = await this.status_repository.snapshot();

    if (snapshotResult.IsFailure) {
      this.logger.error(snapshotResult.Error);
    }

    const snapshot = snapshotResult.IsSuccess ? snapshotResult.Value : null;

    this.write({
      status: {
        version: SERVER_VERSION,
        uptime_seconds: Math.floor(process.uptime()),
        database_ok: snapshot !== null,
        products_synced_at: snapshot?.products_synced_at?.toISOString(),
        pending_dispatches: snapshot?.pending_dispatches ?? 0,
        failed_dispatches: snapshot?.failed_dispatches ?? 0,
      },
    });
  }

  private write(message: TServerMessage): void {
    this.upstream?.next(message);
  }

  private handleError(error: unknown): void {
    const code = (error as { code?: unknown } | null)?.code;
    const details = String(
      (error as { details?: unknown } | null)?.details ?? error,
    );

    if (typeof code === 'number' && REJECTED_CODES.includes(code)) {
      this.logger.error(SYSTEM_MESSAGE.ERROR.CHANNEL_REJECTED(details));
      this.stopped = true;
      this.close();
      return;
    }

    this.logger.warn(SYSTEM_MESSAGE.ERROR.CHANNEL_UNREACHABLE(details));
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    this.close();

    if (this.stopped) {
      return;
    }

    this.retryTimer = setTimeout(() => this.connect(), this.retryMs);
    this.retryTimer.unref();
    this.retryMs = Math.min(this.retryMs * 2, CHANNEL_LIMITS.RETRY_MAX_MS);
  }

  private close(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    const upstream = this.upstream;
    const subscription = this.subscription;

    this.upstream = null;
    this.subscription = null;

    upstream?.complete();
    subscription?.unsubscribe();
  }
}
