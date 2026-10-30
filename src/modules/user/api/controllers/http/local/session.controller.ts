import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_USER_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_USER_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { SessionsQueryDto, UserParamDto } from '../../../../application/dto';

//Common
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { ISessionService } from '../../../../domain/interfaces/services';
import type { TSessionsQuerySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { USER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class SessionHttpController {
  constructor(
    @Inject(USER_PROVIDER_TOKENS.SERVICES.SESSION)
    private readonly service: ISessionService,
  ) {}

  @Get(HTTP_LOCAL_USER_ROUTER.SESSIONS)
  @HttpManagerAccess()
  async sessions(
    @Param() params: UserParamDto,
    @Query() query: SessionsQueryDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;
    const input = query as unknown as TSessionsQuerySchema;

    const sessionsResult = await this.service.sessions(id, input);

    if (sessionsResult.IsFailure) {
      return HttpErrorMapper.reply(res, sessionsResult.Error);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_USER_MESSAGE.SUCCESS.SESSIONS_RETRIEVED,
      sessionsResult.Value.data,
      sessionsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Delete(HTTP_LOCAL_USER_ROUTER.REVOKE_SESSION)
  @HttpManagerAccess()
  async revoke(
    @Param() params: UserParamDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const revokeResult = await this.service.revoke(id);

    if (revokeResult.IsFailure) {
      return HttpErrorMapper.reply(res, revokeResult.Error);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_USER_MESSAGE.SUCCESS.SESSION_REVOKED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
