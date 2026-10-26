import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TDataResponse } from '@domain/types/shared';
import type { ICloudAuthenticationRepository } from '../../../domain/interfaces/repositories';
import type {
  TLoginOutput,
  TMfaCodeOutput,
  TResetPasswordOutput,
} from '../../../domain/types/entities';
import type {
  TLoginInput,
  TMfaCodeInput,
  TResetPasswordInput,
} from '../../../domain/types/services';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TAuthenticationGrpc = {
  login(
    data: TLoginInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TLoginOutput>>;
  mfa_qr(
    data: Record<string, never>,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<string>>;
  mfa_code(
    data: TMfaCodeInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TMfaCodeOutput>>;
  reset_password(
    data: TResetPasswordInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TResetPasswordOutput>>;
};

@Injectable()
export class CloudAuthenticationRepository
  implements ICloudAuthenticationRepository, OnModuleInit
{
  private authentication_service!: TAuthenticationGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authentication_service = this.client.getService<TAuthenticationGrpc>(
      CLOUD_GRPC_SERVICE.AUTHENTICATION,
    );
  }

  login = async (
    input: TLoginInput,
  ): Promise<ResultPattern<TLoginOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.authentication_service.login(
        input,
        CloudRequest.metadata(),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  mfaQr = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<string, ServiceError>> => {
    const response = await CloudRequest.send(
      this.authentication_service.mfa_qr(
        {},
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  mfaCode = async (
    input: TMfaCodeInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TMfaCodeOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.authentication_service.mfa_code(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  resetPassword = async (
    input: TResetPasswordInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.authentication_service.reset_password(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };
}
