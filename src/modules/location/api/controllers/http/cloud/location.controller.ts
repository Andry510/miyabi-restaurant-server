import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import { LOCATION_TAG, LOCATION_CLOUD_LOCATIONS_DOCS } from '../../../swagger';
import { HTTP_CLOUD_LOCATION_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { LocationsQueryDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ILocationService } from '../../../../domain/interfaces/services';
import type { TLocationsQuerySchema } from '../../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { LOCATION_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(LOCATION_TAG)
export class LocationHttpController {
  constructor(
    @Inject(LOCATION_PROVIDER_TOKENS.SERVICES.LOCATION)
    private readonly service: ILocationService,
  ) {}

  @HttpDocs(LOCATION_CLOUD_LOCATIONS_DOCS)
  @Get(HTTP_CLOUD_LOCATION_ROUTER.LOCATION.LOCATIONS)
  async locations(
    @Query() query: LocationsQueryDto,
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TLocationsQuerySchema;

    const locationsResult = await this.service.locations(input, access_token);

    if (locationsResult.IsFailure) {
      const response = locationsResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_MESSAGE_GLOBAL.SUCCESS.RETRIEVED,
      locationsResult.Value.data,
      locationsResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
