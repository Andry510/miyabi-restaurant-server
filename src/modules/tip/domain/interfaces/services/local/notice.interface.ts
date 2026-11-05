//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TTipPoolDetailOutput } from '../../../types/entities';

export interface INoticeService {
  closed(
    poolResult: ResultPattern<TTipPoolDetailOutput, ServiceError>,
  ): ResultPattern<TTipPoolDetailOutput, ServiceError>;

  sanctioned(
    userId: string,
    sanction: string,
    poolResult: ResultPattern<TTipPoolDetailOutput, ServiceError>,
  ): ResultPattern<TTipPoolDetailOutput, ServiceError>;
}
