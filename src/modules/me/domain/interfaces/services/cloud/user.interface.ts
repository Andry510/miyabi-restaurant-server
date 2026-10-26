//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserOutput } from '../../../types/entities';

export interface IUserService {
  user(
    accessToken: string | null,
  ): Promise<ResultPattern<TUserOutput, ServiceError>>;

  uploadPicture(
    picture: Uint8Array,
    accessToken: string | null,
  ): Promise<ResultPattern<string, ServiceError>>;

  removePicture(
    accessToken: string | null,
  ): Promise<ResultPattern<null, ServiceError>>;
}
