//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';

export interface IExportService {
  export(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>>;
}
