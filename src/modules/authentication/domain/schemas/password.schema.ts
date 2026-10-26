import {
  check,
  type InferOutput,
  minLength,
  nonEmpty,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

const PasswordSchema = pipe(
  string(ERROR_MESSAGE_SCHEMA.password.type),
  nonEmpty(ERROR_MESSAGE_SCHEMA.password.nonEmpty),
  minLength(8, ERROR_MESSAGE_SCHEMA.password.minLength),
);

export const ResetPasswordBodySchema = pipe(
  strictObject({
    new_password: PasswordSchema,
    confirm_password: PasswordSchema,
  }),
  check(
    ({ new_password, confirm_password }) => new_password === confirm_password,
    ERROR_MESSAGE_SCHEMA.password.match,
  ),
);

export type TResetPasswordBodySchema = InferOutput<
  typeof ResetPasswordBodySchema
>;
