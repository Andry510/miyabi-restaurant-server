//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { TCheckOutput } from '../../../types/entities';

export interface ICheckService {
  current(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput | null, ServiceError>>;

  checkIn(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput, ServiceError>>;

  checkOut(
    user: TUserDetail,
  ): Promise<ResultPattern<TCheckOutput, ServiceError>>;
}
