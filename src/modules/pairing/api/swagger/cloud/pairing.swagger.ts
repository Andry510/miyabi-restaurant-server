import { HttpStatus } from '@nestjs/common';

//Api
import { API_PAIRING_MESSAGE } from '../../messages';

//Application
import { RegisterDto, ReplaceTokenDto } from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const PAIRING_CLOUD_REGISTER_DOCS: THttpDocs = {
  summary: 'Emparejar el servidor con un enrollment token',
  description:
    'Guarda el server_token cifrado y abre el canal con la nube sin reiniciar. Si antes estaba emparejado a otro local, borra la copia de productos y los pedidos del día.',
  cloud: true,
  unpaired: true,
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_PAIRING_MESSAGE.SUCCESS.SERVER_PAIRED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_PAIRING_MESSAGE.ERROR.ALREADY_PAIRED,
    },
    { status: HttpStatus.CONFLICT, message: API_MESSAGE_GLOBAL.ERROR.CONFLICT },
  ],
};

export const PAIRING_CLOUD_REPLACE_TOKEN_DOCS: THttpDocs = {
  summary: 'Guardar el token regenerado del mismo local',
  description:
    'Solo con el servidor desvinculado (unlinked) y un token del mismo local. Lo prueba con la nube antes de guardarlo.',
  cloud: true,
  unpaired: true,
  body: ReplaceTokenDto,
  success: API_PAIRING_MESSAGE.SUCCESS.TOKEN_REPLACED,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_PAIRING_MESSAGE.ERROR.INVALID_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_PAIRING_MESSAGE.ERROR.INVALID_TOKEN,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_PAIRING_MESSAGE.ERROR.ALREADY_PAIRED,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_PAIRING_MESSAGE.ERROR.NOT_UNLINKED,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_PAIRING_MESSAGE.ERROR.LOCATION_MISMATCH,
    },
    { status: HttpStatus.CONFLICT, message: API_MESSAGE_GLOBAL.ERROR.CONFLICT },
  ],
};

export const PAIRING_CLOUD_STATUS_DOCS: THttpDocs = {
  summary:
    'Estado del emparejamiento (status, location_id, unlinked_reason, fechas)',
  unpaired: true,
  success: API_PAIRING_MESSAGE.SUCCESS.STATUS_RETRIEVED,
};
