//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudRegisterInput } from '../../types/services';

export interface ICloudServerRepository {
  register(
    data: TCloudRegisterInput,
    enrollmentToken: string,
  ): Promise<ResultPattern<string, ServiceError>>;
}
