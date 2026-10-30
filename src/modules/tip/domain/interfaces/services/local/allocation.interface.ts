//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type {
  TAreaBodySchema,
  TAreaStatusBodySchema,
  TMyTipsQuerySchema,
} from '../../../schemas';
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

  areaStatus(
    id: string,
    workAreaId: string,
    input: TAreaStatusBodySchema,
  ): Promise<ResultPattern<TTipPoolDetailOutput, ServiceError>>;

  export(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>>;

  mine(
    user: TUserDetail,
    input: TMyTipsQuerySchema,
  ): Promise<ResultPattern<TMyTipsOutput, ServiceError>>;
}
