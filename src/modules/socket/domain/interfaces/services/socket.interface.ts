//Domain
import type { TSocketHandler } from '../../types/services';

export interface ISocketService {
  on(event: string, handler: TSocketHandler): void;

  connect(): void;
}
