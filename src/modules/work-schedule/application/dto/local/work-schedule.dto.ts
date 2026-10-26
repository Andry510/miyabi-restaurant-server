import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  RegisterSchema,
  UpdateBodySchema,
  WorkSchedulesQuerySchema,
} from '../../../domain/schemas';

export class WorkScheduleParamDto {
  static schema = ParamIdSchema;
}

export class WorkSchedulesQueryDto {
  static schema = WorkSchedulesQuerySchema;
}

export class RegisterDto {
  static schema = RegisterSchema;
}

export class UpdateBodyDto {
  static schema = UpdateBodySchema;
}
