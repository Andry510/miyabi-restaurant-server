import {
  check,
  type InferOutput,
  length,
  minLength,
  nonEmpty,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

const passwordField = pipe(
  string(ERROR_MESSAGE_SCHEMA.password.type),
  nonEmpty(ERROR_MESSAGE_SCHEMA.password.nonEmpty),
  minLength(8, ERROR_MESSAGE_SCHEMA.password.minLength),
);

export const ChangePasswordBodySchema = pipe(
  strictObject({
    current_password: passwordField,
    new_password: passwordField,
    confirm_password: passwordField,
  }),
  check(
    ({ new_password, confirm_password }) => new_password === confirm_password,
    ERROR_MESSAGE_SCHEMA.password.match,
  ),
  check(
    ({ current_password, new_password }) => current_password !== new_password,
    ERROR_MESSAGE_SCHEMA.password.same,
  ),
);

export type TChangePasswordBodySchema = InferOutput<
  typeof ChangePasswordBodySchema
>;

export const UpdateProfileBodySchema = strictObject({
  phone_number: pipe(
    string(ERROR_MESSAGE_SCHEMA.phone_number.type),
    length(10, ERROR_MESSAGE_SCHEMA.phone_number.length),
  ),
});

export type TUpdateProfileBodySchema = InferOutput<
  typeof UpdateProfileBodySchema
>;
