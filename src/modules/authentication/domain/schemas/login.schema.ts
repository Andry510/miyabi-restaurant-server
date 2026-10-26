import {
  email,
  type InferOutput,
  nonEmpty,
  pipe,
  strictObject,
  string,
  toLowerCase,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

export const LoginBodySchema = strictObject({
  email: pipe(
    string(ERROR_MESSAGE_SCHEMA.email.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.email.nonEmpty),
    email(ERROR_MESSAGE_SCHEMA.email.email),
    toLowerCase(),
  ),
  password: pipe(
    string(ERROR_MESSAGE_SCHEMA.password.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.password.nonEmpty),
  ),
});

export type TLoginBodySchema = InferOutput<typeof LoginBodySchema>;
