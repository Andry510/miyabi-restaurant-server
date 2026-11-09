import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  TIP_TAG,
  TIP_LOCAL_RULE_RULES_DOCS,
  TIP_LOCAL_RULE_UPDATE_DOCS,
} from '../../../swagger';
import { API_TIP_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_TIP_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { RulesBodyDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IRuleService } from '../../../../domain/interfaces/services';
import type { TRulesBodySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TIP_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(TIP_TAG)
export class RuleHttpController {
  constructor(
    @Inject(TIP_PROVIDER_TOKENS.SERVICES.RULE)
    private readonly service: IRuleService,
  ) {}

  @HttpDocs(TIP_LOCAL_RULE_RULES_DOCS)
  @Get(HTTP_LOCAL_TIP_ROUTER.RULES)
  @HttpManagerAccess()
  async rules(@Res() res: Response): Promise<Response> {
    const rulesResult = await this.service.rules();

    if (rulesResult.IsFailure) {
      return HttpErrorMapper.reply(res, rulesResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.RULES_RETRIEVED,
      rulesResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(TIP_LOCAL_RULE_UPDATE_DOCS)
  @Put(HTTP_LOCAL_TIP_ROUTER.UPDATE_RULES)
  @HttpManagerAccess()
  async update(
    @Body() body: RulesBodyDto,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRulesBodySchema;

    const updateResult = await this.service.update(input);

    if (updateResult.IsFailure) {
      return HttpErrorMapper.reply(res, updateResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_TIP_MESSAGE.SUCCESS.RULES_UPDATED,
      updateResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
