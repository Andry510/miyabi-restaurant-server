//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TServerMessageBody } from '../../../../../channel/domain/types/services';

export interface IReportService {
  attendance(
    params: unknown,
  ): Promise<ResultPattern<TServerMessageBody, ServiceError>>;
}
