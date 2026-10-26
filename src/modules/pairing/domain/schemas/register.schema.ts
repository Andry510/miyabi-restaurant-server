import {
  type InferOutput,
  maxLength,
  nonEmpty,
  pipe,
  strictObject,
  string,
  trim,
} from 'valibot';

import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

export const RegisterSchema = pipe(
  strictObject({
    enrollment_token: pipe(
      string(ERROR_MESSAGE_SCHEMA.enrollment_token.type),
      trim(),
      nonEmpty(ERROR_MESSAGE_SCHEMA.enrollment_token.nonEmpty),
    ),
    name: pipe(
      string(ERROR_MESSAGE_SCHEMA.name.type),
      trim(),
      nonEmpty(ERROR_MESSAGE_SCHEMA.name.nonEmpty),
      maxLength(150, ERROR_MESSAGE_SCHEMA.name.maxLength),
    ),
  }),
);

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;
