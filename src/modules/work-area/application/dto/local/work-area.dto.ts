import {
  WorkAreasQuerySchema,
  RegisterSchema,
  UpdateBodySchema,
} from '../../../domain/schemas';

export class WorkAreasQueryDto {
  static schema = WorkAreasQuerySchema;
}

export class RegisterDto {
  static schema = RegisterSchema;
}

export class UpdateBodyDto {
  static schema = UpdateBodySchema;
}
