import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  AreaBodySchema,
  AreaParamSchema,
  MyTipsQuerySchema,
  PoolsQuerySchema,
  RegisterSchema,
  RulesBodySchema,
  UpdateBodySchema,
} from '../../../domain/schemas';

export class TipParamDto {
  static schema = ParamIdSchema;
}

export class AreaParamDto {
  static schema = AreaParamSchema;
}

export class RulesBodyDto {
  static schema = RulesBodySchema;
}

export class PoolsQueryDto {
  static schema = PoolsQuerySchema;
}

export class MyTipsQueryDto {
  static schema = MyTipsQuerySchema;
}

export class RegisterDto {
  static schema = RegisterSchema;
}

export class UpdateBodyDto {
  static schema = UpdateBodySchema;
}

export class AreaBodyDto {
  static schema = AreaBodySchema;
}
