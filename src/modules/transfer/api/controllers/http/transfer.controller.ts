import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';

//Api
import { API_TRANSFER_MESSAGE } from '../../messages';
import { HTTP_TRANSFER_ROUTER } from '../../routers';

//Application
// oxlint-disable-next-line typescript/consistent-type-imports
import {
  ReceiveTransferBodyDto,
  RegisterBodyDto,
  TransferParamDto,
  TransfersQueryDto,
} from '../../../application/dto';

//Common
import { HttpAuthorization } from '@common/decorators/request';
import { HttpValibotPipe } from '@common/pipes';

//Domain
import type { ITransferService } from '../../../domain/interfaces/services';
import type {
  TReceiveTransferSchema,
  TRegisterBodySchema,
  TTransferParamSchema,
  TTransfersQuerySchema,
} from '../../../domain/schemas';
import type { TTransferOutput } from '../../../domain/types/entities';

//Infrastructure
import {
  ControllerResponseMapper,
  HttpErrorMapper,
} from '@infrastructure/mappers/shared';
import { TRANSFER_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Controller()
@UsePipes(HttpValibotPipe)
export class TransferHttpController {
  constructor(
    @Inject(TRANSFER_PROVIDER_TOKENS.SERVICES.TRANSFER)
    private readonly service: ITransferService,
  ) {}

  @Post(HTTP_TRANSFER_ROUTER.TRANSFER.REGISTER)
  async register(
    @Body() body: RegisterBodyDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = body as unknown as TRegisterBodySchema;

    const registerResult = await this.service.register(input, access_token);

    if (registerResult.IsFailure) {
      const response = registerResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TTransferOutput>(
      API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_CREATED,
      registerResult.Value,
    );

    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get(HTTP_TRANSFER_ROUTER.TRANSFER.TRANSFERS)
  async transfers(
    @Query() query: TransfersQueryDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = query as unknown as TTransfersQuerySchema;

    const transfersResult = await this.service.transfers(input, access_token);

    if (transfersResult.IsFailure) {
      const response = transfersResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toPaginationResult(
      API_TRANSFER_MESSAGE.SUCCESS.TRANSFERS_RETRIEVED,
      transfersResult.Value.data,
      transfersResult.Value.metadata,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Get(HTTP_TRANSFER_ROUTER.TRANSFER.TRANSFER)
  async transfer(
    @Param() params: TransferParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = params as unknown as TTransferParamSchema;

    const transferResult = await this.service.transfer(input, access_token);

    if (transferResult.IsFailure) {
      const response = transferResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TTransferOutput>(
      API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_RETRIEVED,
      transferResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_TRANSFER_ROUTER.FLOW.RECEIVE)
  async receive(
    @Param() params: TransferParamDto,
    @Body() body: ReceiveTransferBodyDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = {
      ...(params as object),
      ...(body as object),
    } as unknown as TReceiveTransferSchema;

    const receiveResult = await this.service.receive(input, access_token);

    if (receiveResult.IsFailure) {
      const response = receiveResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TTransferOutput>(
      API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_RECEIVED,
      receiveResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }

  @Patch(HTTP_TRANSFER_ROUTER.FLOW.CANCEL)
  async cancel(
    @Param() params: TransferParamDto,
    @HttpAuthorization() access_token: string | null,
    @Res() res: Response,
  ): Promise<Response> {
    const input = params as unknown as TTransferParamSchema;

    const cancelResult = await this.service.cancel(input, access_token);

    if (cancelResult.IsFailure) {
      const response = cancelResult.Error;
      return HttpErrorMapper.reply(res, response);
    }

    const response = ControllerResponseMapper.toDataResult<TTransferOutput>(
      API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_CANCELLED,
      cancelResult.Value,
    );

    return res.status(HttpStatus.OK).json(response);
  }
}
