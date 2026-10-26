import type { TErrorLayer } from '@domain/types/config';

export class DomainError extends Error {
  readonly layer: TErrorLayer;
  readonly origin: string;
  readonly timestamp: Date;

  constructor(message: string, layer: TErrorLayer, origin: string) {
    super(message);
    this.layer = layer;
    this.origin = origin;
    this.timestamp = new Date();
  }
}
