//Domain
import type { TDispatchToSend } from '../../../types/repositories';

export interface IDispatchService {
  isSending(orderId: string): boolean;

  claim(orderId: string): boolean;

  release(orderId: string): void;

  dispatch(
    orderId: string,
    dispatches: TDispatchToSend[],
    accessToken: string | null,
  ): Promise<boolean>;
}
