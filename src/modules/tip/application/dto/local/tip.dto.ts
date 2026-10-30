import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  AreaBodySchema,
  AreaParamSchema,
  AreaStatusBodySchema,
  MyTipsQuerySchema,
  PoolSanctionBodySchema,
  PoolSanctionParamSchema,
  PoolsQuerySchema,
  RegisterSchema,
  RulesBodySchema,
  SanctionTypeBodySchema,
  UpdateBodySchema,
  UpdateSanctionTypeBodySchema,
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

export class AreaStatusBodyDto {
  static schema = AreaStatusBodySchema;
}

export class SanctionTypeBodyDto {
  static schema = SanctionTypeBodySchema;
}

export class UpdateSanctionTypeBodyDto {
  static schema = UpdateSanctionTypeBodySchema;
}

export class PoolSanctionBodyDto {
  static schema = PoolSanctionBodySchema;
}

export class PoolSanctionParamDto {
  static schema = PoolSanctionParamSchema;
}
