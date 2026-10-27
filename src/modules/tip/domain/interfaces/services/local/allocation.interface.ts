//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { TAreaBodySchema, TMyTipsQuerySchema } from '../../../schemas';
import type {
  TMyTipsOutput,
  TTipPoolDetailOutput,
} from '../../../types/entities';

export interface IAllocationService {
  area(
    id: string,
    workAreaId: string,
    input: TAreaBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  resetArea(
    id: string,
    workAreaId: string,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  mine(
    user: TUserDetail,
    input: TMyTipsQuerySchema,
  ): Promise<ResultPattern<TMyTipsOutput, ServiceError>>;
}
