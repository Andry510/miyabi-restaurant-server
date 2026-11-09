//Api
import { API_TRANSFER_ITEM_MESSAGE } from '../../messages';

//Application
import {
  TransferItemParamDto,
  TransferItemsQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TRANSFER_ITEM_CLOUD_TRANSFER_ITEMS_DOCS: THttpDocs = {
  summary: 'Productos de un pedido',
  access: 'manager',
  cloud: true,
  params: TransferItemParamDto,
  query: TransferItemsQueryDto,
  success: API_TRANSFER_ITEM_MESSAGE.SUCCESS.ITEMS_RETRIEVED,
  data: 'pagination',
};
