import {
  type InferOutput,
  nonEmpty,
  pipe,
  strictObject,
  string,
  uuid,
} from 'valibot';

import { SCHEMA_MESSAGES } from '@common/messages';

export const ParamIdSchema = pipe(
  strictObject({
    id: pipe(
      string(SCHEMA_MESSAGES.ERROR.USER_ID.TYPE),
      nonEmpty(SCHEMA_MESSAGES.ERROR.USER_ID.REQUIRED),
      uuid(SCHEMA_MESSAGES.ERROR.USER_ID.UUID),
    ),
  }),
);

export type TParamIdSchema = InferOutput<typeof ParamIdSchema>;
