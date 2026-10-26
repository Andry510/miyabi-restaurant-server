import {
  type InferOutput,
  nonEmpty,
  pipe,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

export const MfaCodeBodySchema = strictObject({
  code: pipe(
    string(ERROR_MESSAGE_SCHEMA.mfa_key.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.mfa_key.nonEmpty),
  ),
});

export type TMfaCodeBodySchema = InferOutput<typeof MfaCodeBodySchema>;
