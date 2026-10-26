import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const HTTP_MANAGER_ACCESS_DECORATOR_KEY = Symbol(
  'HTTP_MANAGER_ACCESS_DECORATOR_KEY',
);

export const HttpManagerAccess = (): CustomDecorator<
  typeof HTTP_MANAGER_ACCESS_DECORATOR_KEY
> => SetMetadata(HTTP_MANAGER_ACCESS_DECORATOR_KEY, true);
