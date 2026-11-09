import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import { ME_TAG, ME_CLOUD_LOCATION_LOCATION_DOCS } from '../../../swagger';
import { API_ME_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_ME_ROUTER } from '../../../routers';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ILocationService } from '../../../../domain/interfaces/services';
import type { TLocationOutput } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(ME_TAG)
export class LocationHttpController {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.SERVICES.LOCATION)
    private readonly service: ILocationService,
  ) {}

  @HttpDocs(ME_CLOUD_LOCATION_LOCATION_DOCS)
  @Get(HTTP_CLOUD_ME_ROUTER.LOCATION.LOCATION)
  async location(
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const locationResult = await this.service.location(access_token);

    if (locationResult.IsFailure) {
      const response = locationResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TLocationOutput>(
      API_ME_MESSAGE.SUCCESS.LOCATION_RETRIEVED,
      locationResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
