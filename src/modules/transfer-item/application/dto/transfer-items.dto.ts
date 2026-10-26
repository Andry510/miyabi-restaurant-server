import {
  TransferItemParamSchema,
  TransferItemsQuerySchema,
} from '../../domain/schemas';

export class TransferItemParamDto {
  static schema = TransferItemParamSchema;
}

export class TransferItemsQueryDto {
  static schema = TransferItemsQuerySchema;
}
