import { HttpStatus } from '@nestjs/common';

//Api
import { API_TRANSFER_MESSAGE } from '../../messages';

//Application
import {
  ReceiveTransferBodyDto,
  RegisterBodyDto,
  TransferParamDto,
  TransfersQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TRANSFER_CLOUD_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear pedido en la nube',
  access: 'manager_cloud',
  cloud: true,
  body: RegisterBodyDto,
  status: HttpStatus.CREATED,
  success: API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_CREATED,
};

export const TRANSFER_CLOUD_TRANSFERS_DOCS: THttpDocs = {
  summary: 'Listar pedidos de la nube',
  access: 'manager_cloud',
  cloud: true,
  query: TransfersQueryDto,
  success: API_TRANSFER_MESSAGE.SUCCESS.TRANSFERS_RETRIEVED,
  data: 'pagination',
};

export const TRANSFER_CLOUD_TRANSFER_DOCS: THttpDocs = {
  summary: 'Ver pedido de la nube',
  access: 'manager_cloud',
  cloud: true,
  params: TransferParamDto,
  success: API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_RETRIEVED,
};

export const TRANSFER_CLOUD_RECEIVE_DOCS: THttpDocs = {
  summary: 'Recibir pedido',
  description:
    'Si la nube no responde, el cambio queda pendiente de confirmar (503 ERROR_TRANSFER_UNCONFIRMED) y se avisa por el socket (transfer.changed) cuando se confirma.',
  access: 'manager_cloud',
  cloud: true,
  params: TransferParamDto,
  body: ReceiveTransferBodyDto,
  success: API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_RECEIVED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_PROCESSING,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_STATUS_CHANGED,
    },
    {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_UNCONFIRMED,
    },
  ],
};

export const TRANSFER_CLOUD_CANCEL_DOCS: THttpDocs = {
  summary: 'Cancelar pedido',
  description:
    'Si la nube no responde, el cambio queda pendiente de confirmar (503 ERROR_TRANSFER_UNCONFIRMED) y se avisa por el socket (transfer.changed) cuando se confirma.',
  access: 'manager_cloud',
  cloud: true,
  params: TransferParamDto,
  success: API_TRANSFER_MESSAGE.SUCCESS.TRANSFER_CANCELLED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_PROCESSING,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_STATUS_CHANGED,
    },
    {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: API_TRANSFER_MESSAGE.ERROR.TRANSFER_UNCONFIRMED,
    },
  ],
};
