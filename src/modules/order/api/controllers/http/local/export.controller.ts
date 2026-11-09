import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import { ORDER_TAG, ORDER_LOCAL_EXPORT_EXPORT_DOCS } from '../../../swagger';
import { API_ORDER_MESSAGE } from '../../../messages';
import { HTTP_LOCAL_ORDER_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { OrderParamDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpManagerAccess } from '@common/decorators/access';
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { TParamIdSchema } from '@domain/schemas/shared';
import type { IExportService } from '../../../../domain/interfaces/services';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ORDER_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(ORDER_TAG)
export class ExportHttpController {
  constructor(
    @Inject(ORDER_PROVIDER_TOKENS.SERVICES.EXPORT)
    private readonly service: IExportService,
  ) {}

  @HttpDocs(ORDER_LOCAL_EXPORT_EXPORT_DOCS)
  @Get(HTTP_LOCAL_ORDER_ROUTER.EXPORT)
  @HttpManagerAccess()
  async export(
    @Param() params: OrderParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const { id } = params as unknown as TParamIdSchema;

    const exportResult = await this.service.export(id, access_token);

    if (exportResult.IsFailure) {
      return HttpErrorMapper.reply(res, exportResult.Error);
    }

    const response = ControllerResponseMapper.toDataResult(
      API_ORDER_MESSAGE.SUCCESS.ORDER_EXPORTED,
      Buffer.from(exportResult.Value),
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
