//Domain
import type {
  TChannelEvent,
  TChannelHandler,
  TChannelRequest,
  TChannelRequestHandler,
} from '../../../types/services';

export interface IChannelService {
  on(event: TChannelEvent, handler: TChannelHandler): void;

  onRequest(request: TChannelRequest, handler: TChannelRequestHandler): void;

  connect(): void;

  reportStatus(): void;
}
