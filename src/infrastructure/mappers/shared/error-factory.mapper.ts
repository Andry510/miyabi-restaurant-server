//Domain
import type { TErrorLayer } from '@domain/types/config';
import type { DomainError } from '@domain/errors';
import { DomainErrorFactory } from '@domain/patterns/errors';

export class ErrorFactoryMapper {
  static toDomainError(
    error: unknown,
    layer: TErrorLayer,
    origin: string,
  ): DomainError {
    switch (layer) {
      case 'Domain': {
        return DomainErrorFactory.Domain(error, origin);
      }
      case 'Infrastructure': {
        return DomainErrorFactory.Infrastructure(error, origin);
      }
      default: {
        return DomainErrorFactory.Unknown(error, origin);
      }
    }
  }
}
