//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type {
  TMineQuerySchema,
  TRequestBodySchema,
  TUpdateRequestSchema,
} from '../../../schemas';
import type { TMyRequestOutput } from '../../../types/entities';

export interface IRequestService {
  save(
    user: TUserDetail,
    input: TRequestBodySchema,
  ): Promise<ResultPattern<TMyRequestOutput, ServiceError>>;

  update(
    user: TUserDetail,
    id: string,
    input: TUpdateRequestSchema,
  ): Promise<ResultPattern<TMyRequestOutput, ServiceError>>;

  remove(
    user: TUserDetail,
    id: string,
  ): Promise<ResultPattern<null, ServiceError>>;

  mine(
    user: TUserDetail,
    input: TMineQuerySchema,
  ): Promise<ResultPattern<TMyRequestOutput[], ServiceError>>;
}
