//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { TLocalUserOutput } from '../../../types/entities';

export interface ILocalService {
  user(user: TUserDetail): ResultPattern<TLocalUserOutput, ServiceError>;
}
