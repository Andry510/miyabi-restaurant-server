import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  ItemBodySchema,
  ItemParamSchema,
  MineQuerySchema,
  OrdersQuerySchema,
  RequestBodySchema,
  UpdateRequestSchema,
} from '../../../domain/schemas';

export class OrderParamDto {
  static schema = ParamIdSchema;
}

export class ItemParamDto {
  static schema = ItemParamSchema;
}

export class RequestBodyDto {
  static schema = RequestBodySchema;
}

export class UpdateRequestDto {
  static schema = UpdateRequestSchema;
}

export class ItemBodyDto {
  static schema = ItemBodySchema;
}

export class OrdersQueryDto {
  static schema = OrdersQuerySchema;
}

export class MineQueryDto {
  static schema = MineQuerySchema;
}
