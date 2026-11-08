import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Api
import { API_TRANSFER_MESSAGE } from '../../../api/messages';

//Domain
import { SERVICE_ERROR_CODE } from '@domain/enums/shared';
import { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudTransferRepository } from '../../../domain/interfaces/repositories';
import type { IConfirmationService } from '../../../domain/interfaces/services';
import type { TTransferOutput } from '../../../domain/types/entities';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import {
  TRANSFER_LIMITS,
  TRANSFER_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import {
  CHANNEL_EVENT,
  CHANNEL_PROVIDER_TOKENS,
} from '../../../../channel/infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

type TTransferEvent = {
  kind?: string;
  transfer?: TTransferOutput;
};

type TPending = {
  access_token: string | null;
  in_flight: boolean;
  since: number;
};

const INVALID_STATUS_CODE =
  API_TRANSFER_MESSAGE.ERROR.TRANSFER_STATUS_CHANGED.code;

const STATUS_CHANGED_KIND = 'status_changed';

@Injectable()
export class ConfirmationService implements IConfirmationService, OnModuleInit {
  private readonly pending = new Map<string, TPending>();
  private rechecking = false;

  constructor(
    @Inject(TRANSFER_PROVIDER_TOKENS.REPOSITORIES.CLOUD_TRANSFER)
    private readonly cloud_transfer_repository: ICloudTransferRepository,
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
  ) {}

  onModuleInit(): void {
    this.channel_service.on(CHANNEL_EVENT.TRANSFER, (payload) =>
      this.changed(payload as TTransferEvent),
    );
    this.channel_service.on(CHANNEL_EVENT.SYNC_REQUIRED, () => this.recheck());
  }

  async confirm(
    transferId: string,
    accessToken: string | null,
    action: () => Promise<ResultPattern<TTransferOutput, ServiceError>>,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    if (this.pending.get(transferId)?.in_flight) {
      return ServiceResultMapper.Conflict(
        API_TRANSFER_MESSAGE.ERROR.TRANSFER_PROCESSING,
      );
    }

    this.pending.set(transferId, {
      access_token: accessToken,
      in_flight: true,
      since: Date.now(),
    });

    const result = await action();

    if (result.IsSuccess) {
      this.pending.delete(transferId);
      return result;
    }

    if (result.Error.code === SERVICE_ERROR_CODE.UNAVAILABLE) {
      const entry = this.pending.get(transferId);

      if (entry) {
        entry.in_flight = false;
      }

      return ResultPattern.Failure(
        new ServiceError(
          'UNAVAILABLE',
          API_TRANSFER_MESSAGE.ERROR.TRANSFER_UNCONFIRMED,
        ),
      );
    }

    this.pending.delete(transferId);

    if (result.Error.message_code === INVALID_STATUS_CODE) {
      return ServiceResultMapper.Conflict(
        API_TRANSFER_MESSAGE.ERROR.TRANSFER_STATUS_CHANGED,
      );
    }

    return result;
  }

  //Functions
  private changed(event: TTransferEvent): void {
    if (!event.transfer) {
      return;
    }

    this.pending.delete(event.transfer.id);
    this.socket_service.emitToManagers(SOCKET_EVENT.TRANSFER_CHANGED, {
      kind: event.kind ?? STATUS_CHANGED_KIND,
      transfer: event.transfer,
    });
  }

  private async recheck(): Promise<void> {
    if (this.rechecking) {
      return;
    }

    this.rechecking = true;

    try {
      for (const [transferId, entry] of this.pending) {
        if (entry.in_flight) {
          continue;
        }

        if (Date.now() - entry.since > TRANSFER_LIMITS.PENDING_TTL_MS) {
          this.pending.delete(transferId);
          continue;
        }

        entry.in_flight = true;

        const result = await this.cloud_transfer_repository.transfer(
          { id: transferId },
          { authorization: entry.access_token },
        );

        if (result.IsSuccess) {
          this.changed({ kind: STATUS_CHANGED_KIND, transfer: result.Value });
          continue;
        }

        if (result.Error.code === SERVICE_ERROR_CODE.UNAVAILABLE) {
          entry.in_flight = false;
          break;
        }

        this.pending.delete(transferId);
      }
    } finally {
      this.rechecking = false;
    }
  }
}
