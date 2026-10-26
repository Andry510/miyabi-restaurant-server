import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const HTTP_PAIRING_ACCESS_DECORATOR_KEY = Symbol(
  'HTTP_PAIRING_ACCESS_DECORATOR_KEY',
);

export const HttpPairingAccess = (): CustomDecorator<
  typeof HTTP_PAIRING_ACCESS_DECORATOR_KEY
> => SetMetadata(HTTP_PAIRING_ACCESS_DECORATOR_KEY, true);
