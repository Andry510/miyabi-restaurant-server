import type { Request } from 'express';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

//Infrastructure
import { ExtractHttpToken } from '@infrastructure/http';

export const HttpAuthorization = createParamDecorator(
  (_param: unknown, ctx: ExecutionContext): string | null =>
    ExtractHttpToken.authorization(ctx.switchToHttp().getRequest<Request>()),
);
