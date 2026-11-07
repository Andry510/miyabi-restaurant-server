//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TUpdateRequestSchema } from '../../../schemas';
import type { TMyRequestOutput } from '../../../types/entities';
import type {
  TRequestChangeResult,
  TSavedRequest,
  TSaveRequestInput,
} from '../../../types/repositories';

export interface IRequestRepository {
  isProductInArea(
    productId: string,
    workAreaId: string,
  ): Promise<ResultPattern<boolean>>;

  save(input: TSaveRequestInput): Promise<ResultPattern<TSavedRequest | null>>;

  update(
    id: string,
    assignmentId: string,
    input: TUpdateRequestSchema,
  ): Promise<ResultPattern<TRequestChangeResult<TMyRequestOutput>>>;

  remove(
    id: string,
    assignmentId: string,
  ): Promise<ResultPattern<TRequestChangeResult<null>>>;

  findMine(
    assignmentId: string,
    from: string,
    to: string,
  ): Promise<ResultPattern<TMyRequestOutput[]>>;
}
