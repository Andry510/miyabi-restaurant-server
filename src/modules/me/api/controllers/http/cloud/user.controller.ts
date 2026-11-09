import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

//Api
import {
  ME_TAG,
  ME_CLOUD_USER_REMOVE_PICTURE_DOCS,
  ME_CLOUD_USER_UPLOAD_PICTURE_DOCS,
  ME_CLOUD_USER_USER_DOCS,
} from '../../../swagger';
import { API_ME_MESSAGE } from '../../../messages';
import { HTTP_CLOUD_ME_ROUTER } from '../../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import { PictureFileDto } from '../../../../application/dto';

//Common
import { HttpDocs } from '@common/decorators/docs';
import { HttpCloudAuthorization } from '@common/decorators/request';
import { HttpPictureInterceptor } from '@common/interceptors';
import { API_MESSAGE_GLOBAL } from '@common/messages';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { IUserService } from '../../../../domain/interfaces/services';
import type { TPictureFileSchema } from '../../../../domain/schemas';
import type { TUserOutput } from '../../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
@ApiTags(ME_TAG)
export class UserHttpController {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.SERVICES.USER)
    private readonly service: IUserService,
  ) {}

  @HttpDocs(ME_CLOUD_USER_USER_DOCS)
  @Get(HTTP_CLOUD_ME_ROUTER.USER.USER)
  async user(
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const userResult = await this.service.user(access_token);

    if (userResult.IsFailure) {
      const response = userResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TUserOutput>(
      API_ME_MESSAGE.SUCCESS.USER_RETRIEVED,
      userResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(ME_CLOUD_USER_UPLOAD_PICTURE_DOCS)
  @Post(HTTP_CLOUD_ME_ROUTER.USER.UPLOAD_PICTURE)
  @UseInterceptors(HttpPictureInterceptor)
  async uploadPicture(
    @UploadedFile() picture: PictureFileDto,
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = picture as unknown as TPictureFileSchema;

    const uploadResult = await this.service.uploadPicture(input, access_token);

    if (uploadResult.IsFailure) {
      const response = uploadResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<string>(
      API_MESSAGE_GLOBAL.SUCCESS.PICTURE_UPLOADED,
      uploadResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @HttpDocs(ME_CLOUD_USER_REMOVE_PICTURE_DOCS)
  @Delete(HTTP_CLOUD_ME_ROUTER.USER.REMOVE_PICTURE)
  async removePicture(
    @HttpCloudAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const removeResult = await this.service.removePicture(access_token);

    if (removeResult.IsFailure) {
      const response = removeResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toMessageResult(
      API_MESSAGE_GLOBAL.SUCCESS.PICTURE_REMOVED,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
