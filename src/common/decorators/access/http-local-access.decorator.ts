import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const HTTP_LOCAL_ACCESS_DECORATOR_KEY = Symbol(
  'HTTP_LOCAL_ACCESS_DECORATOR_KEY',
);

export const HttpLocalAccess = (): CustomDecorator<
  typeof HTTP_LOCAL_ACCESS_DECORATOR_KEY
> => SetMetadata(HTTP_LOCAL_ACCESS_DECORATOR_KEY, true);
