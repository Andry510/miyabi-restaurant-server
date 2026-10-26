import {
  JobPositionsQuerySchema,
  RegisterSchema,
  UpdateBodySchema,
} from '../../../domain/schemas';

export class JobPositionsQueryDto {
  static schema = JobPositionsQuerySchema;
}

export class RegisterDto {
  static schema = RegisterSchema;
}

export class UpdateBodyDto {
  static schema = UpdateBodySchema;
}
