import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { IServerRepository } from '../../../domain/interfaces/repositories';
import type { IServerService } from '../../../domain/interfaces/services';
import type {
  TPairingRow,
  TPairingState,
  TUnlinkedHandler,
} from '../../../domain/types';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { CloudRequest } from '@infrastructure/grpc/cloud';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Crypto } from '@infrastructure/securities';
import {
  REPOSITORY_LOGGER_NAME,
  REPOSITORY_PROVIDER_TOKENS,
  SERVER_UNLINK_REASON,
} from '../../../infrastructure/constants';

@Injectable()
export class ServerService implements IServerService, OnModuleInit {
  private readonly logger = new Logger(REPOSITORY_LOGGER_NAME.SERVICE.SERVER);
  private readonly handlers: TUnlinkedHandler[] = [];
  private token: string | null = null;
  private current: TPairingState = {
    status: 'unpaired',
    location_id: null,
    unlinked_reason: null,
    paired_at: null,
    unlinked_at: null,
  };

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.SERVER)
    private readonly server_repository: IServerRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    CloudRequest.onServerRejected((code) => void this.unlink(code));

    const rowResult = await this.server_repository.find();

    if (rowResult.IsFailure) {
      this.logger.error(rowResult.Error);
      return;
    }

    const row = rowResult.Value;
    this.apply(row);

    if (row.status !== 'paired') {
      return;
    }

    const tokenResult = row.server_token_enc
      ? Crypto.decrypt(row.server_token_enc)
      : null;

    if (!tokenResult || tokenResult.IsFailure) {
      if (tokenResult) {
        this.logger.error(tokenResult.Error);
      }

      await this.unlink(SERVER_UNLINK_REASON.LOCAL_TOKEN_UNREADABLE);
      return;
    }

    this.useToken(tokenResult.Value);
  }

  serverToken(): ResultPattern<string, ServiceError> {
    if (!this.token) {
      return ServiceResultMapper.Conflict(
        this.current.status === 'unlinked'
          ? API_MESSAGE_GLOBAL.ERROR.SERVER_UNLINKED
          : API_MESSAGE_GLOBAL.ERROR.SERVER_NOT_PAIRED,
      );
    }

    return ServiceResultMapper.Ok(this.token);
  }

  state(): TPairingState {
    return { ...this.current };
  }

  async pair(
    serverToken: string,
    locationId: string,
  ): Promise<ResultPattern<TPairingState, ServiceError>> {
    const encryptedResult = Crypto.encrypt(serverToken);

    if (encryptedResult.IsFailure) {
      this.logger.error(encryptedResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const previousLocationId = this.current.location_id;

    const pairResult = await this.server_repository.pair({
      server_token_enc: encryptedResult.Value,
      location_id: locationId,
      wipe: previousLocationId !== null && previousLocationId !== locationId,
    });

    if (pairResult.IsFailure) {
      this.logger.error(pairResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    this.apply(pairResult.Value);
    this.useToken(serverToken);

    return ServiceResultMapper.Ok(this.state());
  }

  async unlink(reason: string): Promise<void> {
    if (this.current.status !== 'paired') {
      return;
    }

    this.useToken(null);
    this.current = {
      ...this.current,
      status: 'unlinked',
      unlinked_reason: reason,
      unlinked_at: new Date(),
    };

    const unlinkResult = await this.server_repository.unlink(reason);

    if (unlinkResult.IsFailure) {
      this.logger.error(unlinkResult.Error);
    } else {
      this.apply(unlinkResult.Value);
    }

    for (const handler of this.handlers) {
      try {
        await handler(this.state());
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  onUnlinked(handler: TUnlinkedHandler): void {
    this.handlers.push(handler);
  }

  //Functions
  private apply({ server_token_enc: _token, ...state }: TPairingRow): void {
    this.current = state;
  }

  private useToken(token: string | null): void {
    this.token = token;
    CloudRequest.useServerToken(token);
  }
}
