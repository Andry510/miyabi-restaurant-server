//Domain
import type { TErrorLayer } from '@domain/types/config';
import { DomainError } from '@domain/errors';

export class DomainErrorFactory {
  private static create = (
    error: unknown,
    layer: TErrorLayer,
    origin: string,
  ): DomainError => {
    const message = error instanceof Error ? error.message : String(error);
    return new DomainError(message, layer, origin);
  };

  static Domain(error: unknown, origin: string): DomainError {
    return this.create(error, 'Domain', origin);
  }

  static Infrastructure(error: unknown, origin: string): DomainError {
    return this.create(error, 'Infrastructure', origin);
  }

  static Unknown(error: unknown, origin: string): DomainError {
    return this.create(error, 'Unknown', origin);
  }
}
