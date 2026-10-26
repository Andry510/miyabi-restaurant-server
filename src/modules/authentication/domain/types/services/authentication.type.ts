//Domain
import type { TClientInput } from '@domain/types/shared';
import type {
  TLoginBodySchema,
  TMfaCodeBodySchema,
  TResetPasswordBodySchema,
} from '../../schemas';

export type TLoginInput = TLoginBodySchema & TClientInput;

export type TMfaCodeInput = TMfaCodeBodySchema & TClientInput;

export type TResetPasswordInput = TResetPasswordBodySchema & TClientInput;
