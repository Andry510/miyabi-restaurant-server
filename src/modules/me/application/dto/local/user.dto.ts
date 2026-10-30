import {
  ChangePasswordBodySchema,
  UpdateProfileBodySchema,
} from '../../../domain/schemas';

export class ChangePasswordBodyDto {
  static schema = ChangePasswordBodySchema;
}

export class UpdateProfileBodyDto {
  static schema = UpdateProfileBodySchema;
}
