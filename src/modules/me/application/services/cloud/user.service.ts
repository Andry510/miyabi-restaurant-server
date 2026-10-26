import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudMeRepository } from '../../../domain/interfaces/repositories';
import type { IUserService } from '../../../domain/interfaces/services';
import type { TUserOutput } from '../../../domain/types/entities';

//Infrastructure
import { ME_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.REPOSITORIES.CLOUD_ME)
    private readonly cloud_me_repository: ICloudMeRepository,
  ) {}

  user(
    accessToken: string | null,
  ): Promise<ResultPattern<TUserOutput, ServiceError>> {
    return this.cloud_me_repository.user({ authorization: accessToken });
  }

  uploadPicture(
    picture: Uint8Array,
    accessToken: string | null,
  ): Promise<ResultPattern<string, ServiceError>> {
    return this.cloud_me_repository.uploadPicture(picture, {
      authorization: accessToken,
    });
  }

  removePicture(
    accessToken: string | null,
  ): Promise<ResultPattern<null, ServiceError>> {
    return this.cloud_me_repository.removePicture({
      authorization: accessToken,
    });
  }
}
