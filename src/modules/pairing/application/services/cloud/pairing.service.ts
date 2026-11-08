import { randomUUID } from 'crypto';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Api
import { API_PAIRING_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudServerRepository } from '../../../domain/interfaces/repositories';
import type { IPairingService } from '../../../domain/interfaces/services';
import type {
  TRegisterSchema,
  TReplaceTokenSchema,
} from '../../../domain/schemas';
import type {
  TPairingStatusOutput,
  TRegisterOutput,
} from '../../../domain/types/entities';
import type { TCloudRegisterInput } from '../../../domain/types/services';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';
import type { INotificationService } from '../../../../notification/domain/interfaces/services';
import type { IServerService } from '../../../../repository/domain/interfaces/services';
import type { TPairingState } from '../../../../repository/domain/types';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import { SERVER_VERSION } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Machine, TokenPayload } from '@infrastructure/utils';
import { PAIRING_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { CHANNEL_PROVIDER_TOKENS } from '../../../../channel/infrastructure/constants';
import {
  NOTIFICATION_PROVIDER_TOKENS,
  NOTIFICATION_TEMPLATE,
} from '../../../../notification/infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

@Injectable()
export class PairingService implements IPairingService, OnModuleInit {
  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.SERVER)
    private readonly server_service: IServerService,
    @Inject(PAIRING_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SERVER)
    private readonly cloud_server_repository: ICloudServerRepository,
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
    @Inject(NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION)
    private readonly notification_service: INotificationService,
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
  ) {}

  onModuleInit(): void {
    this.server_service.onUnlinked((state) => this.unlinked(state));
  }

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TRegisterOutput, ServiceError>> {
    if (this.server_service.state().status === 'paired') {
      return ServiceResultMapper.Conflict(
        API_PAIRING_MESSAGE.ERROR.ALREADY_PAIRED,
      );
    }

    const macAddress = Machine.macAddress();

    const data: TCloudRegisterInput = {
      name: input.name,
      version: SERVER_VERSION,
      instance_id: randomUUID(),
      platform: Machine.platform(),
      ...(macAddress && { mac_address: macAddress }),
    };

    const registerResult = await this.cloud_server_repository.register(
      data,
      input.enrollment_token,
    );

    if (registerResult.IsFailure) {
      return ResultPattern.Failure(registerResult.Error);
    }

    const serverToken = registerResult.Value;
    const locationId = TokenPayload.locationId(serverToken);

    if (!locationId) {
      return ServiceResultMapper.InternalServerError();
    }

    const pairResult = await this.server_service.pair(serverToken, locationId);

    if (pairResult.IsFailure) {
      return ResultPattern.Failure(pairResult.Error);
    }

    this.channel_service.connect();

    return ServiceResultMapper.Ok({ name: data.name, location_id: locationId });
  }

  async replaceToken(
    input: TReplaceTokenSchema,
  ): Promise<ResultPattern<TPairingStatusOutput, ServiceError>> {
    const state = this.server_service.state();

    if (state.status === 'paired') {
      return ServiceResultMapper.Conflict(
        API_PAIRING_MESSAGE.ERROR.ALREADY_PAIRED,
      );
    }

    if (state.status === 'unpaired') {
      return ServiceResultMapper.Conflict(
        API_PAIRING_MESSAGE.ERROR.NOT_UNLINKED,
      );
    }

    const locationId = TokenPayload.locationId(input.server_token);

    if (!locationId) {
      return ServiceResultMapper.BadRequest(
        API_PAIRING_MESSAGE.ERROR.INVALID_TOKEN,
      );
    }

    if (locationId !== state.location_id) {
      return ServiceResultMapper.Conflict(
        API_PAIRING_MESSAGE.ERROR.LOCATION_MISMATCH,
      );
    }

    const verifyResult = await this.cloud_server_repository.verify(
      input.server_token,
    );

    if (verifyResult.IsFailure) {
      return verifyResult.Error.code === 'UNAUTHORIZED'
        ? ServiceResultMapper.Unauthorized(
            API_PAIRING_MESSAGE.ERROR.INVALID_TOKEN,
          )
        : ResultPattern.Failure(verifyResult.Error);
    }

    const pairResult = await this.server_service.pair(
      input.server_token,
      locationId,
    );

    if (pairResult.IsFailure) {
      return ResultPattern.Failure(pairResult.Error);
    }

    this.channel_service.connect();

    return ServiceResultMapper.Ok(pairResult.Value);
  }

  status(): ResultPattern<TPairingStatusOutput, ServiceError> {
    return ServiceResultMapper.Ok(this.server_service.state());
  }

  //Functions
  private async unlinked(state: TPairingState): Promise<void> {
    this.socket_service.emitToManagers(SOCKET_EVENT.SERVER_UNLINKED, state);

    await this.notification_service.notify({
      template_code: NOTIFICATION_TEMPLATE.SERVER_UNLINKED,
      data: { reason: state.unlinked_reason ?? '' },
      entity_type: null,
      entity_id: null,
    });
  }
}
