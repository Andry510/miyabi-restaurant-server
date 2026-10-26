import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { HTTP_LOCATION_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { LocationsQueryDto } from '../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ILocationService } from '../../../domain/interfaces/services';
import type { TLocationsQuerySchema } from '../../../domain/schemas';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { LOCATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class LocationHttpController {
  constructor(
    @Inject(LOCATION_PROVIDER_TOKENS.SERVICES.LOCATION)
    private readonly service: ILocationService,
  ) {}

  @Get(HTTP_LOCATION_ROUTER.LOCATION.LOCATIONS)
  async locations(
    @Query() query: LocationsQueryDto,
    @HttpAuthorization() access_token: string | null,
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
