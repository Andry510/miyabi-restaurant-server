//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens } from '@domain/types/shared';
import type { TLocationOutput, TUserOutput } from '../../../types/entities';

export interface ICloudMeRepository {
  user(tokens: TCloudTokens): Promise<ResultPattern<TUserOutput, ServiceError>>;

  location(
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TLocationOutput, ServiceError>>;

  uploadPicture(
    picture: Uint8Array,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<string, ServiceError>>;

  removePicture(
    tokens: TCloudTokens,
  ): Promise<ResultPattern<null, ServiceError>>;
}
