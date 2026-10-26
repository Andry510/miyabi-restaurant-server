import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  RegisterSchema,
  ShiftsQuerySchema,
  UpdateBodySchema,
} from '../../../domain/schemas';

export class ShiftParamDto {
  static schema = ParamIdSchema;
}

export class ShiftsQueryDto {
  static schema = ShiftsQuerySchema;
}

export class RegisterDto {
  static schema = RegisterSchema;
}

export class UpdateBodyDto {
  static schema = UpdateBodySchema;
}
