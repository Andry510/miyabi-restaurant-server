import type { Observable } from 'rxjs';

//Domain
import type { TCloudMessage, TServerMessage } from '../../../types/services';

export interface ICloudChannelRepository {
  open(upstream: Observable<TServerMessage>): Observable<TCloudMessage>;
}
