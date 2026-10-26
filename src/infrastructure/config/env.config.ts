import 'dotenv/config';
import { safeParse } from 'valibot';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import { EnvSchema, type TEnvSchema } from '@domain/schemas/config';

const result = safeParse(EnvSchema, process.env);

if (result.issues) {
  throw new Error(SYSTEM_MESSAGE.ERROR.INVALID_ENV_VARIABLE);
}

export const Env: TEnvSchema = result.output;
