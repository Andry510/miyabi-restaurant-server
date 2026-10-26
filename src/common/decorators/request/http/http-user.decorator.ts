import type { Request } from 'express';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

//Domain
import type { TKeyUserDetail, TUserDetail } from '@domain/types/entities';

export const HttpUser = createParamDecorator(
  (
    param: TKeyUserDetail,
    ctx: ExecutionContext,
  ): TUserDetail | TUserDetail[TKeyUserDetail] | null => {
    const { user } = ctx.switchToHttp().getRequest<Request>();

    if (!user) {
      return null;
    }

    if (param) {
      return user[param];
    }

    return user;
  },
);
