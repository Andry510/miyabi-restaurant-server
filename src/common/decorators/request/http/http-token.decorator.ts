import type { Request } from 'express';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

//Infrastructure
import { ExtractHttpToken } from '@infrastructure/http';

export const HttpAuthorization = createParamDecorator(
  (_param: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return (
      request.cloud_access_token ?? ExtractHttpToken.authorization(request)
    );
  },
);

export const HttpCloudAuthorization = createParamDecorator(
  (_param: unknown, ctx: ExecutionContext): string | null =>
    ctx.switchToHttp().getRequest<Request>().cloud_access_token ?? null,
);
