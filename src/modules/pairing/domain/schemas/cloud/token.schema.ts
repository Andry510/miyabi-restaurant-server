import {
  type InferOutput,
  maxLength,
  nonEmpty,
  pipe,
  strictObject,
  string,
  trim,
} from 'valibot';

import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

export const ReplaceTokenSchema = pipe(
  strictObject({
    server_token: pipe(
      string(ERROR_MESSAGE_SCHEMA.server_token.type),
      trim(),
      nonEmpty(ERROR_MESSAGE_SCHEMA.server_token.nonEmpty),
      maxLength(2048, ERROR_MESSAGE_SCHEMA.server_token.maxLength),
    ),
  }),
);

export type TReplaceTokenSchema = InferOutput<typeof ReplaceTokenSchema>;
